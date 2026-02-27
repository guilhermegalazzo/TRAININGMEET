import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsGateway } from './events.gateway';
import { LiveLocationModule } from '../live-location/live-location.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
    imports: [LiveLocationModule, NotificationsModule],
    controllers: [EventsController],
    providers: [EventsService, EventsGateway],
    exports: [EventsService, EventsGateway],
})
export class EventsModule { }
