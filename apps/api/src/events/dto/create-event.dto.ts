import { IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum EventVisibility {
    PRIVATE = 'PRIVATE',
    FRIENDS = 'FRIENDS',
    PUBLIC = 'PUBLIC',
}

export enum ApprovalMode {
    AUTO = 'AUTO',
    MANUAL = 'MANUAL',
}

export class CreateEventDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    @IsOptional()
    locationName?: string;

    @IsNumber()
    @Min(-90)
    @Max(90)
    latitude: number;

    @IsNumber()
    @Min(-180)
    @Max(180)
    longitude: number;

    @IsISO8601()
    startTime: string;

    @IsISO8601()
    @IsOptional()
    endTime?: string;

    @IsEnum(EventVisibility)
    @IsOptional()
    visibility?: EventVisibility;

    @IsEnum(ApprovalMode)
    @IsOptional()
    approvalMode?: ApprovalMode;

    @IsNumber()
    @IsOptional()
    @Min(1)
    maxParticipants?: number;

    @IsString()
    @IsOptional()
    meetingPoint?: string;

    @IsString()
    @IsOptional()
    recurrenceRule?: string;
}
