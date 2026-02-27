import { Module } from '@nestjs/common';
import { LiveLocationService } from './live-location.service';

@Module({
    providers: [LiveLocationService],
    exports: [LiveLocationService],
})
export class LiveLocationModule { }
