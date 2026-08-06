import { Global, Module, Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

/**
 * Módulo Redis reutilizable (@Global).
 *
 * Exporta un cliente IORedis singleton bajo el token REDIS_CLIENT.
 * Úsalo en cualquier módulo inyectando:
 *   @Inject(REDIS_CLIENT) private readonly redis: Redis
 *
 * Casos de uso actuales: BullMQ (B10).
 * Casos de uso futuros: caché, rate limiting distribuido, locks, sesiones.
 */
const redisProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: (config: ConfigService): Redis => {
    const url = config.get<string>('redis.url');

    if (url) {
      return new Redis(url, { connectTimeout: 5000, maxRetriesPerRequest: 3 });
    }

    const host = config.get<string>('redis.host') ?? 'localhost';
    const port = config.get<number>('redis.port') ?? 6379;
    const password = config.get<string>('redis.password') || undefined;

    return new Redis({ host, port, password, connectTimeout: 5000, maxRetriesPerRequest: 3 });
  },
};

@Global()
@Module({
  providers: [redisProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
