import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HttpHealthIndicator, HealthCheck, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { DatabaseService } from './database/database.service';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private http: HttpHealthIndicator,
        private db: DatabaseService,
    ) { }

    @Get()
    @HealthCheck()
    check() {
        return this.health.check([
            () => ({ db: { status: this.db.db ? 'up' : 'down' } }),
        ]);
    }
}
