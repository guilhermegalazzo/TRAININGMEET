import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient, verifyToken } from '@clerk/backend';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class ClerkMiddleware implements NestMiddleware {
    private clerkClient;

    constructor(private configService: ConfigService) {
        this.clerkClient = createClerkClient({
            secretKey: this.configService.get<string>('CLERK_SECRET_KEY'),
        });
    }

    async use(req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            next();
            return;
        }

        const token = authHeader.replace('Bearer ', '');
        try {
            const decoded = await verifyToken(token, {
                secretKey: this.configService.get<string>('CLERK_SECRET_KEY')
            });
            (req as any).auth = { userId: decoded.sub };
            next();
        } catch (error) {
            throw new UnauthorizedException('Invalid auth token');
        }
    }
}
