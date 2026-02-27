import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../../../../packages/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { SendMessageDto, CreateThreadDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
    constructor(private readonly databaseService: DatabaseService) { }

    private get db() {
        return this.databaseService.db;
    }

    async createThread(createThreadDto: CreateThreadDto) {
        const [thread] = await this.db.insert(schema.chatThreads).values({
            ...createThreadDto,
        }).returning();
        return thread;
    }

    async sendMessage(userId: string, sendMessageDto: SendMessageDto) {
        const { threadId, content } = sendMessageDto;

        // Verify thread exists
        const thread = await this.db.query.chatThreads.findFirst({
            where: eq(schema.chatThreads.id, threadId),
        });
        if (!thread) throw new NotFoundException('Thread not found');

        // In a real app, check if user is participant of the event/thread

        const [message] = await this.db.insert(schema.chatMessages).values({
            threadId,
            senderId: userId,
            content,
        }).returning();

        return message;
    }

    async getMessages(threadId: string, limit = 50) {
        return this.db.query.chatMessages.findMany({
            where: eq(schema.chatMessages.threadId, threadId),
            orderBy: [desc(schema.chatMessages.createdAt)],
            limit,
            with: {
                sender: true,
            },
        });
    }

    async getThreadsByEvent(eventId: string) {
        return this.db.query.chatThreads.findMany({
            where: eq(schema.chatThreads.eventId, eventId),
        });
    }
}
