import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

export class SendMessageDto {
    @IsUUID()
    @IsNotEmpty()
    threadId: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}

export class CreateThreadDto {
    @IsUUID()
    @IsOptional()
    eventId?: string;

    @IsString()
    @IsOptional()
    title?: string;
}
