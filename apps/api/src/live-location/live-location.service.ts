import { Injectable, ForbiddenException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../../../../packages/db/schema';
import { eq, and, sql, lt } from 'drizzle-orm';
import { isAfter, isBefore, subMinutes, addMinutes, subHours } from 'date-fns';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LiveLocationService implements OnModuleInit {
    private secretKey: string;
    private lastUpdates = new Map<string, number>(); // Simple throttling store: key = userId:eventId

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) {
        this.secretKey = this.configService.get<string>('CLERK_SECRET_KEY')!;
    }

    onModuleInit() {
        // Basic cleanup interval every hour
        setInterval(() => this.cleanupPoints(), 3600000);
    }

    private get db() {
        return this.databaseService.db;
    }

    async verifyUser(token: string) {
        try {
            const { sub: userId } = await verifyToken(token, {
                secretKey: this.secretKey,
            });
            return await this.db.query.users.findFirst({
                where: eq(schema.users.clerkId, userId),
            });
        } catch (e) {
            return null;
        }
    }

    async canStreamLocation(userId: string, eventId: string): Promise<boolean> {
        const event = await this.db.query.events.findFirst({
            where: eq(schema.events.id, eventId),
        });

        if (!event) return false;

        // 1. Participant Check
        const rsvp = await this.db.query.eventRSVPs.findFirst({
            where: and(
                eq(schema.eventRSVPs.eventId, eventId),
                eq(schema.eventRSVPs.userId, userId),
                eq(schema.eventRSVPs.status, 'YES')
            ),
        });

        if (!rsvp && event.creatorId !== userId) return false;

        // 2. Time Window: 10 min before to 5 min after (or event duration)
        const now = new Date();
        const startWindow = subMinutes(new Date(event.startTime), 10);
        // If event has no end time, assume 2 hours duration for safety
        const eventEnd = event.endTime ? new Date(event.endTime) : addMinutes(new Date(event.startTime), 120);
        const endWindow = addMinutes(eventEnd, 5);

        return isAfter(now, startWindow) && isBefore(now, endWindow);
    }

    async recordPoint(userId: string, eventId: string, lat: number, lng: number) {
        // 3. Throttling (3 seconds)
        const throttleKey = `${userId}:${eventId}`;
        const now = Date.now();
        const lastUpdate = this.lastUpdates.get(throttleKey) || 0;

        if (now - lastUpdate < 3000) {
            return null; // Throttled
        }

        // Get or Create Session
        let session = await this.db.query.liveLocationSessions.findFirst({
            where: and(
                eq(schema.liveLocationSessions.eventId, eventId),
                eq(schema.liveLocationSessions.userId, userId),
                eq(schema.liveLocationSessions.isActive, true)
            )
        });

        if (!session) {
            [session] = await this.db.insert(schema.liveLocationSessions).values({
                eventId,
                userId,
                isActive: true,
            }).returning();
        }

        const [point] = await this.db.insert(schema.liveLocationPoints).values({
            sessionId: session.id,
            latitude: lat,
            longitude: lng,
        }).returning();

        this.lastUpdates.set(throttleKey, now);
        return point;
    }

    async cleanupPoints() {
        const twentyFourHoursAgo = subHours(new Date(), 24);
        await this.db.delete(schema.liveLocationPoints)
            .where(lt(schema.liveLocationPoints.timestamp, twentyFourHoursAgo));

        console.log('Live location cleanup completed');
    }
}
