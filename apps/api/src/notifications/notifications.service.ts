import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as schema from '../../../../packages/db/schema';
import { eq, and, sql, gte } from 'drizzle-orm';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { isWithinInterval, setHours, setMinutes } from 'date-fns';

export enum NotificationType {
    INVITE_RECEIVED = 'INVITE_RECEIVED',
    JOIN_REQUEST = 'JOIN_REQUEST',
    REQUEST_APPROVED = 'REQUEST_APPROVED',
    EVENT_STARTING = 'EVENT_STARTING',
    POST_EVENT_EMOJI = 'POST_EVENT_EMOJI',
}

@Injectable()
export class NotificationsService implements OnModuleInit {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
    ) { }

    onModuleInit() {
        const serviceAccount = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
        if (serviceAccount) {
            admin.initializeApp({
                credential: admin.credential.cert(JSON.parse(serviceAccount)),
            });
        }
    }

    private get db() {
        return this.databaseService.db;
    }

    async sendNotification(userId: string, type: NotificationType, data: any) {
        const user = await this.db.query.users.findFirst({
            where: eq(schema.users.id, userId),
        });

        if (!user) return;

        // 1. Anti-spam: Max 10 notifications per day
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const count = await this.db.select({ count: sql<number>`count(*)` })
            .from(schema.notifications)
            .where(and(
                eq(schema.notifications.userId, userId),
                gte(schema.notifications.createdAt, today)
            ));

        if (Number(count[0].count) >= 10) return;

        // 2. Quiet Hours (e.g., 22:00 - 07:00)
        const now = new Date();
        const quietStart = setHours(setMinutes(new Date(), 0), 22);
        const quietEnd = setHours(setMinutes(new Date(), 0), 7);

        // Check if current time is between 22h and 7h
        const isQuietTime = now >= quietStart || now <= quietEnd;

        // In-app persists always, push only if not quiet time
        const [notification] = await this.db.insert(schema.notifications).values({
            userId,
            type,
            title: this.getTemplate(type, data).title,
            content: this.getTemplate(type, data).body,
            isRead: false,
        }).returning();

        if (!isQuietTime && user.expoPushToken) {
            await this.sendPush(user.expoPushToken, type, data);
        }

        return notification;
    }

    private getTemplate(type: NotificationType, data: any) {
        const templates = {
            [NotificationType.INVITE_RECEIVED]: {
                title: 'Novo Convite! 🚀',
                body: `${data.senderName} te convidou para o treino "${data.eventTitle}".`,
            },
            [NotificationType.JOIN_REQUEST]: {
                title: 'Pedido de entrada ✋',
                body: `${data.senderName} quer participar do seu treino "${data.eventTitle}".`,
            },
            [NotificationType.REQUEST_APPROVED]: {
                title: 'Pedido Aprovado! ✅',
                body: `Sua entrada no treino "${data.eventTitle}" foi aprovada!`,
            },
            [NotificationType.EVENT_STARTING]: {
                title: 'Treino Começando! 🔥',
                body: `Seu treino "${data.eventTitle}" começa em ${data.minutes} minutos. Vamos nessa?`,
            },
            [NotificationType.POST_EVENT_EMOJI]: {
                title: 'Como foi o treino? 💪',
                body: `O treino "${data.eventTitle}" acabou. Deixe seu emoji de reação para a galera!`,
            }
        };
        return templates[type];
    }

    private async sendPush(token: string, type: NotificationType, data: any) {
        const { title, body } = this.getTemplate(type, data);
        try {
            await admin.messaging().send({
                token,
                notification: { title, body },
                data: { type, ...data },
            });
        } catch (e) {
            console.error('Push failed', e);
        }
    }
}
