import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, Header } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { SearchEventsDto } from './dto/search-events.dto';
import type { Request } from 'express';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Body() createEventDto: CreateEventDto, @Req() req: Request) {
        const clerkId = (req as any).auth?.userId;
        return this.eventsService.create(createEventDto, clerkId);
    }

    @Get()
    findAll(@Query() search: SearchEventsDto, @Req() req: Request) {
        const clerkId = (req as any).auth?.userId;
        return this.eventsService.findAll(search, clerkId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Req() req: Request) {
        const clerkId = (req as any).auth?.userId;
        return this.eventsService.findOne(id, clerkId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto, @Req() req: Request) {
        const clerkId = (req as any).auth?.userId;
        return this.eventsService.update(id, updateEventDto, clerkId);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: Request) {
        const clerkId = (req as any).auth?.userId;
        return this.eventsService.remove(id, clerkId);
    }

    @Post(':id/rsvp')
    rsvp(@Param('id') id: string, @Body('status') status: 'YES' | 'NO' | 'MAYBE', @Req() req: Request) {
        const clerkId = (req as any).auth?.userId;
        return this.eventsService.rsvp(id, status, clerkId);
    }

    @Get(':id/ics')
    @Header('Content-Type', 'text/calendar')
    @Header('Content-Disposition', 'attachment; filename=event.ics')
    getIcs(@Param('id') id: string) {
        return this.eventsService.getIcs(id);
    }
}
