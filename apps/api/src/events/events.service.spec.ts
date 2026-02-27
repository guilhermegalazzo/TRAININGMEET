import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { DatabaseService } from '../database/database.service';
import { ForbiddenException, BadRequestException } from '@nestjs/common';

describe('EventsService', () => {
    let service: EventsService;
    let dbService: any;

    beforeEach(async () => {
        dbService = {
            db: {
                query: {
                    users: { findFirst: jest.fn() },
                    events: { findFirst: jest.fn() },
                    friendships: { findFirst: jest.fn() },
                    eventRSVPs: { findFirst: jest.fn() },
                },
                select: jest.fn().mockReturnValue({
                    from: jest.fn().mockReturnValue({
                        where: jest.fn().mockResolvedValue([])
                    })
                }),
                insert: jest.fn().mockReturnValue({
                    values: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ id: '1' }])
                    }),
                    onConflictDoNothing: jest.fn().mockResolvedValue({})
                }),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                { provide: DatabaseService, useValue: dbService },
            ],
        }).compile();

        service = module.get<EventsService>(EventsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Visibility Rules', () => {
        it('should throw ForbiddenException for PRIVATE event if not creator', async () => {
            const mockEvent = { id: 'evt-1', visibility: 'PRIVATE', creatorId: 'user-1' };
            dbService.db.query.events.findFirst.mockResolvedValue(mockEvent);
            dbService.db.query.users.findFirst.mockResolvedValue({ id: 'user-2' });

            await expect(service.findOne('evt-1', 'clerk-2')).rejects.toThrow(ForbiddenException);
        });

        it('should allow creator to view PRIVATE event', async () => {
            const mockEvent = { id: 'evt-1', visibility: 'PRIVATE', creatorId: 'user-1' };
            dbService.db.query.events.findFirst.mockResolvedValue(mockEvent);
            dbService.db.query.users.findFirst.mockResolvedValue({ id: 'user-1' });

            const result = await service.findOne('evt-1', 'clerk-1');
            expect(result).toEqual(mockEvent);
        });
    });

    describe('RSVP Rules', () => {
        it('should throw BadRequestException if event is full', async () => {
            const mockEvent = { id: 'evt-1', maxParticipants: 5 };
            dbService.db.query.events.findFirst.mockResolvedValue(mockEvent);
            dbService.db.query.users.findFirst.mockResolvedValue({ id: 'user-1' });

            // Mocking getRSVPCount
            dbService.db.select.mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ count: 5 }])
                })
            });

            await expect(service.rsvp('evt-1', 'YES', 'clerk-1')).rejects.toThrow(BadRequestException);
        });

        it('should return message when manual approval is needed', async () => {
            const mockEvent = { id: 'evt-1', approvalMode: 'MANUAL' };
            dbService.db.query.events.findFirst.mockResolvedValue(mockEvent);
            dbService.db.query.users.findFirst.mockResolvedValue({ id: 'user-1' });
            dbService.db.query.eventRSVPs.findFirst.mockResolvedValue(null);

            const result = await service.rsvp('evt-1', 'YES', 'clerk-1');
            expect(result).toHaveProperty('message', 'Join request sent for manual approval');
        });
    });
});
