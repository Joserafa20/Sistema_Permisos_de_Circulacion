import { Inject, Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import type Redis from 'ioredis';
import { REDIS_CLIENT } from '../../redis/redis.constants';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redis.ping();
      const isUp = result === 'PONG';
      return this.getStatus(key, isUp);
    } catch {
      return this.getStatus(key, false, { message: 'No se pudo conectar a Redis' });
    }
  }
}
