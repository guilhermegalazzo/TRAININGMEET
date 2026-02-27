import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  boolean,
  integer,
  doublePrecision,
  pgEnum,
  index,
  uniqueIndex,
  jsonb,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// --- ENUMS ---
export const visibilityEnum = pgEnum('visibility', ['PRIVATE', 'FRIENDS', 'PUBLIC']);
export const rsvpStatusEnum = pgEnum('rsvp_status', ['YES', 'NO', 'MAYBE', 'PENDING']);
export const approvalModeEnum = pgEnum('approval_mode', ['AUTO', 'MANUAL']);
export const friendRequestStatusEnum = pgEnum('friend_request_status', ['PENDING', 'ACCEPTED', 'REJECTED']);

// --- TABLES ---

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  username: varchar('username', { length: 100 }).unique(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const friendships = pgTable('friendships', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  friendId: uuid('friend_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unq: uniqueIndex('friendship_unique_idx').on(t.userId, t.friendId),
}));

export const friendRequests = pgTable('friend_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  fromUserId: uuid('from_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  toUserId: uuid('to_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: friendRequestStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  idx: index('friend_request_to_idx').on(t.toUserId),
}));

export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  creatorId: uuid('creator_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  locationName: varchar('location_name', { length: 255 }),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time'),
  visibility: visibilityEnum('visibility').default('PUBLIC').notNull(),
  approvalMode: approvalModeEnum('approval_mode').default('AUTO').notNull(),
  maxParticipants: integer('max_participants'),
  meetingPoint: text('meeting_point'),
  recurrenceRule: text('recurrence_rule'), // RRULE string
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  geoIdx: index('events_geo_idx').on(t.latitude, t.longitude),
  timeIdx: index('events_time_idx').on(t.startTime),
}));

export const eventInvites = pgTable('event_invites', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  receiverId: uuid('receiver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: rsvpStatusEnum('status').default('PENDING').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const eventRSVPs = pgTable('event_rsvps', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: rsvpStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  unq: uniqueIndex('event_rsvp_unique_idx').on(t.eventId, t.userId),
}));

export const joinRequests = pgTable('join_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: friendRequestStatusEnum('status').default('PENDING').notNull(),
  message: text('message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const liveLocationSessions = pgTable('live_location_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  isActive: boolean('is_active').default(true).notNull(),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  endedAt: timestamp('ended_at'),
}, (t) => ({
  eventUserIdx: index('live_session_event_user_idx').on(t.eventId, t.userId),
}));

export const liveLocationPoints = pgTable('live_location_points', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').notNull().references(() => liveLocationSessions.id, { onDelete: 'cascade' }),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
}, (t) => ({
  sessionIdx: index('live_points_session_idx').on(t.sessionId, t.timestamp),
}));

export const chatThreads = pgTable('chat_threads', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }), // Thread linked to event
  title: varchar('title', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const chatMessages = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  threadId: uuid('thread_id').notNull().references(() => chatThreads.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  threadTimeIdx: index('chat_messages_thread_time_idx').on(t.threadId, t.createdAt),
}));

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(), // e.g., 'event_invite', 'friend_request'
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  data: jsonb('data'), // Optional metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  userIdx: index('notifications_user_idx').on(t.userId),
}));

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events, { relationName: 'creator' }),
  rsvps: many(eventRSVPs),
  friendships: many(friendships, { relationName: 'user' }),
  receivedFriendships: many(friendships, { relationName: 'friend' }),
  sentFriendRequests: many(friendRequests, { relationName: 'sender' }),
  receivedFriendRequests: many(friendRequests, { relationName: 'receiver' }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.creatorId],
    references: [users.id],
    relationName: 'creator',
  }),
  rsvps: many(eventRSVPs),
  invites: many(eventInvites),
  joinRequests: many(joinRequests),
  liveSessions: many(liveLocationSessions),
  chatThreads: many(chatThreads),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  event: one(events, {
    fields: [chatThreads.eventId],
    references: [events.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
