import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LiveLocationService } from '../live-location/live-location.service';

@WebSocketGateway({
    cors: { origin: '*' },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private readonly liveLocationService: LiveLocationService) { }

    async handleConnection(client: Socket) {
        const token = client.handshake.auth?.token;
        if (!token) {
            client.disconnect();
            return;
        }
        const user = await this.liveLocationService.verifyUser(token);
        if (!user) {
            client.disconnect();
            return;
        }
        (client as any).user = user;
        console.log(`Client authenticated: ${user.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('joinEventLive')
    async handleJoinEventLive(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { eventId: string }
    ) {
        const user = (client as any).user;
        const canJoin = await this.liveLocationService.canStreamLocation(user.id, data.eventId);

        if (canJoin) {
            client.join(`event:${data.eventId}:live`);
            return { status: 'success', room: `event:${data.eventId}:live` };
        } else {
            return { status: 'denied', message: 'Not allowed or event not started' };
        }
    }

    @SubscribeMessage('updateLocation')
    async handleUpdateLocation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { eventId: string; lat: number; lng: number }
    ) {
        const user = (client as any).user;
        const canStream = await this.liveLocationService.canStreamLocation(user.id, data.eventId);

        if (!canStream) return;

        const point = await this.liveLocationService.recordPoint(
            user.id,
            data.eventId,
            data.lat,
            data.lng
        );

        if (point) {
            // Broadcast to others in the room
            this.server.to(`event:${data.eventId}:live`).emit('locationUpdate', {
                userId: user.id,
                userName: user.name,
                lat: data.lat,
                lng: data.lng,
                timestamp: point.timestamp,
            });
        }
    }
}
