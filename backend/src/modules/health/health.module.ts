import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { RedisHealthIndicator } from './indicators/redis.health-indicator';
import { MinioHealthIndicator } from './indicators/minio.health-indicator';
import { SmtpHealthIndicator } from './indicators/smtp.health-indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, MinioHealthIndicator, SmtpHealthIndicator],
})
export class HealthModule {}
