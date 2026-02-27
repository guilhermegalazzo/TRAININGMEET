import { IsNumber, IsOptional, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchEventsDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    latitude?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    longitude?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    radiusKm?: number;

    @IsOptional()
    @IsISO8601()
    startDate?: string;

    @IsOptional()
    @IsISO8601()
    endDate?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minLat?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxLat?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    minLng?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    maxLng?: number;
}
