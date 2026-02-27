import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../database/schema';
import { eq, and, or, gte, lte, sql, inArray, ne } from 'drizzle-orm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventsDto } from './dto/search-events.dto';
import { RRule, rrulestr } from 'rrule';
import { createEvents, EventAttributes } from 'ics';
import { addDays, startOfDay, endOfDay } from 'date-fns';

import { NotificationsService, NotificationType } from '../notifications/notifications.service';

@Injectable()
export class EventsService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly notificationsService: NotificationsService,
    ) { }

    private get db() {
        return this.databaseService.db;
    }

    async create(createEventDto: CreateEventDto, clerkUserId: string) {
        const user = await this.getUserByClerkId(clerkUserId);
        if (!user) throw new NotFoundException('User not found');

        const [event] = await this.db.insert(schema.events).values({
            ...createEventDto,
            creatorId: user.id,
            startTime: new Date(createEventDto.startTime),
            endTime: createEventDto.endTime ? new Date(createEventDto.endTime) : null,
        }).returning();

        return event;
    }

    async findAll(search: SearchEventsDto, clerkUserId?: string) {
        let currentUser: schema.User | null = null;
        if (clerkUserId) {
            const user = await this.getUserByClerkId(clerkUserId);
            currentUser = user || null;
        }

        const conditions = [];

        // 1. Visibility Rules
        const visibilityConditions = [eq(schema.events.visibility, 'PUBLIC')];

        if (currentUser) {
            // Show events created by user regardless of visibility
            visibilityConditions.push(eq(schema.events.creatorId, currentUser.id));

            // FRIENDS visibility logic
            const userFriends = await this.getUserFriendIds(currentUser.id);
            if (userFriends.length > 0) {
                visibilityConditions.push(
                    and(
                        eq(schema.events.visibility, 'FRIENDS'),
                        inArray(schema.events.creatorId, userFriends)
                    ) as any
                );
            }
        }

        conditions.push(or(...visibilityConditions));

        // 2. Date Range
        if (search.startDate) {
            conditions.push(gte(schema.events.startTime, new Date(search.startDate)));
        }
        if (search.endDate) {
            conditions.push(lte(schema.events.startTime, new Date(search.endDate)));
        }

        // 3. Radius Search (Haversine approx if lat/lng/radius provided)
        if (search.latitude && search.longitude && search.radiusKm) {
            // approx bounding box first for performance, then distance filter if needed
            // 1 deg lat works out to ~111km
            const latDelta = search.radiusKm / 111.0;
            const lonDelta = search.radiusKm / (111.0 * Math.cos(search.latitude * (Math.PI / 180)));

            conditions.push(gte(schema.events.latitude, search.latitude - latDelta));
            conditions.push(lte(schema.events.latitude, search.latitude + latDelta));
            conditions.push(gte(schema.events.longitude, search.longitude - lonDelta));
            conditions.push(lte(schema.events.longitude, search.longitude + lonDelta));
        }

        // 4. Bounding Box Search
        if (search.minLat && search.maxLat && search.minLng && search.maxLng) {
            conditions.push(gte(schema.events.latitude, search.minLat));
            conditions.push(lte(schema.events.latitude, search.maxLat));
            conditions.push(gte(schema.events.longitude, search.minLng));
            conditions.push(lte(schema.events.longitude, search.maxLng));
        }

        const results = await this.db.select().from(schema.events).where(and(...conditions));

        // 4. Recurrence Expansion
        // If searching by day, we might need to expand instances of recurring events
        return this.expandRecurrences(results, search.startDate, search.endDate);
    }

    async findOne(id: string, clerkUserId: string) {
        const user = await this.getUserByClerkId(clerkUserId);
        const event = await this.db.query.events.findFirst({
            where: eq(schema.events.id, id),
            with: {
                creator: true,
                rsvps: true,
            }
        });

        if (!event) throw new NotFoundException('Event not found');

        // Visibility Check
        if (event.visibility === 'PRIVATE' && event.creatorId !== user?.id) {
            throw new ForbiddenException('You do not have permission to view this event');
        }

        if (event.visibility === 'FRIENDS' && event.creatorId !== user?.id) {
            const isFriend = await this.checkFriendship(user!.id, event.creatorId);
            if (!isFriend) throw new ForbiddenException('Friends only event');
        }

        return event;
    }

    async update(id: string, updateEventDto: UpdateEventDto, clerkUserId: string) {
        const user = await this.getUserByClerkId(clerkUserId);
        const event = await this.db.query.events.findFirst({
            where: eq(schema.events.id, id)
        });

        if (!event) throw new NotFoundException('Event not found');
        if (event.creatorId !== user?.id) throw new ForbiddenException('Only creator can edit');

        const [updated] = await this.db.update(schema.events)
            .set({
                ...updateEventDto,
                startTime: updateEventDto.startTime ? new Date(updateEventDto.startTime) : undefined,
                endTime: updateEventDto.endTime ? new Date(updateEventDto.endTime) : undefined,
                updatedAt: new Date(),
            })
            .where(eq(schema.events.id, id))
            .returning();

        return updated;
    }

    async remove(id: string, clerkUserId: string) {
        const user = await this.getUserByClerkId(clerkUserId);
        const event = await this.db.query.events.findFirst({
            where: eq(schema.events.id, id)
        });

        if (!event) throw new NotFoundException('Event not found');
        if (event.creatorId !== user?.id) throw new ForbiddenException('Only creator can delete');

        await this.db.delete(schema.events).where(eq(schema.events.id, id));
        return { success: true };
    }

    async rsvp(eventId: string, status: 'YES' | 'NO' | 'MAYBE', clerkUserId: string) {
        const user = await this.getUserByClerkId(clerkUserId);
        if (!user) throw new NotFoundException('User not found');

        const event = await this.db.query.events.findFirst({
            where: eq(schema.events.id, eventId)
        });

        if (!event) throw new NotFoundException('Event not found');

        // Capacity Check
        if (status === 'YES' && event.maxParticipants) {
            const currentCount = await this.getRSVPCount(eventId);
            if (currentCount >= event.maxParticipants) {
                throw new BadRequestException('Event is full');
            }
        }

        // Check if manual approval is required
        if (event.approvalMode === 'MANUAL' && status === 'YES') {
            // Check if user already has an RSVP or a Join Request
            const existingRsvp = await this.db.query.eventRSVPs.findFirst({
                where: and(eq(schema.eventRSVPs.eventId, eventId), eq(schema.eventRSVPs.userId, user.id))
            });

            if (!existingRsvp || existingRsvp.status !== 'YES') {
                // Need to create JOIN REQUEST instead of direct RSVP YES
                await this.db.insert(schema.joinRequests).values({
                    eventId,
                    userId: user.id,
                    status: 'PENDING'
                }).onConflictDoNothing();

                // Trigger Notification to Creator
                await this.notificationsService.sendNotification(event.creatorId, NotificationType.JOIN_REQUEST, {
                    senderName: user.name || 'Alguém',
                    eventTitle: event.title,
                });

                return { message: 'Join request sent for manual approval' };
            }
        }

        await this.db.insert(schema.eventRSVPs).values({
            eventId,
            userId: user.id,
            status: status as any,
        }).onConflictDoUpdate({
            target: [schema.eventRSVPs.eventId, schema.eventRSVPs.userId],
            set: { status: status as any, updatedAt: new Date() }
        });

        return { success: true, status };
    }

    async getIcs(id: string) {
        const event = await this.db.query.events.findFirst({
            where: eq(schema.events.id, id)
        });
        if (!event) throw new NotFoundException('Event not found');

        const start = new Date(event.startTime);
        const end = event.endTime ? new Date(event.endTime) : addDays(start, 0.5);

        const icsEvent: EventAttributes = {
            title: event.title,
            description: event.description || '',
            location: event.locationName || '',
            start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
            end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
            geo: { lat: event.latitude, lon: event.longitude },
        };

        const { error, value } = createEvents([icsEvent]);
        if (error) throw new BadRequestException('Failed to generate ICS');
        return value;
    }

    private async getUserByClerkId(clerkId: string) {
        return this.db.query.users.findFirst({
            where: eq(schema.users.clerkId, clerkId),
        });
    }

    private async getUserFriendIds(userId: string) {
        const friends = await this.db.select().from(schema.friendships)
            .where(or(eq(schema.friendships.userId, userId), eq(schema.friendships.friendId, userId)));

        return friends.map(f => f.userId === userId ? f.friendId : f.userId);
    }

    private async checkFriendship(userA: string, userB: string) {
        if (userA === userB) return true;
        const friendship = await this.db.query.friendships.findFirst({
            where: or(
                and(eq(schema.friendships.userId, userA), eq(schema.friendships.friendId, userB)),
                and(eq(schema.friendships.userId, userB), eq(schema.friendships.friendId, userA))
            )
        });
        return !!friendship;
    }

    private async getRSVPCount(eventId: string) {
        const result = await this.db.select({ count: sql<number>`count(*)` })
            .from(schema.eventRSVPs)
            .where(and(eq(schema.eventRSVPs.eventId, eventId), eq(schema.eventRSVPs.status, 'YES')));
        return result[0].count;
    }

    private expandRecurrences(events: schema.Event[], startStr?: string, endStr?: string) {
        if (!startStr || !endStr) return events;

        const searchStart = new Date(startStr);
        const searchEnd = new Date(endStr);
        const allInstances = [];

        for (const event of events) {
            if (!event.recurrenceRule) {
                allInstances.push(event);
                continue;
            }

            try {
                const rule = rrulestr(event.recurrenceRule, { dtstart: event.startTime });
                const instances = rule.between(searchStart, searchEnd, true);

                for (const instDate of instances) {
                    allInstances.push({
                        ...event,
                        startTime: instDate,
                        // We don't recalculate endTime properly here for brevity, 
                        // but ideally we'd preserve duration
                    });
                }
            } catch (e) {
                allInstances.push(event);
            }
        }

        return allInstances;
    }
}
