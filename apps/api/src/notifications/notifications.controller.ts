import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../../../../packages/db/schema';
import { eq, desc } from 'drizzle-orm';
import { Request } from 'express';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly databaseService: DatabaseService) { }

    @Get()
    async findAll(@Req() req: Request) {
        const userId = (req as any).auth?.userId;
        // Need to resolve clerkId to app database ID
        const user = await this.databaseService.db.query.users.findFirst({
            where: eq(schema.users.clerkId, userId)
        });
        if (!user) return [];

        return this.databaseService.db.query.notifications.findMany({
            where: eq(schema.notifications.userId, user.id),
            orderBy: [desc(schema.notifications.createdAt)],
        });
    }

    @Patch(':id/read')
    async markAsRead(@Param('id') id: string) {
        return this.databaseService.db.update(schema.notifications)
            .set({ isRead: true })
            .where(eq(schema.notifications.id, id));
    }
}
