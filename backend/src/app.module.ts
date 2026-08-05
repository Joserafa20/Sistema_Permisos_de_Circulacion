import { Module, MiddlewareConsumer, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { HealthModule } from './modules/health/health.module';
import { ConfiguracionInstitucionalModule } from './modules/configuracion-institucional/configuracion-institucional.module';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/infrastructure/guards/roles.guard';
import { UsuariosModule } from './modules/usuarios/usuarios.module';
import { CiudadanosModule } from './modules/ciudadanos/ciudadanos.module';
import { MotocicletasModule } from './modules/motocicletas/motocicletas.module';
import { MotivosModule } from './modules/motivos/motivos.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { PermisosModule } from './modules/permisos/permisos.module';
import { NotificacionesModule } from './modules/notificaciones/notificaciones.module';
import { StorageModule } from './modules/storage/storage.module';
import { RedisModule } from './modules/redis/redis.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { DependenciasModule } from './modules/dependencias/dependencias.module';
import { ReportesModule } from './modules/reportes/reportes.module';

@Module({
  imports: [
    // ── Configuración global ───────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),

    // ── Logger estructurado (Pino) ─────────────────────────────────
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('app.nodeEnv') === 'production' ? 'info' : 'debug',
          transport:
            config.get<string>('app.nodeEnv') !== 'production'
              ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
              : undefined,
          redact: ['req.headers.authorization', 'req.body.password', 'req.body.token'],
          serializers: {
            req: (req: { method: string; url: string; id: string }) => ({
              id: req.id,
              method: req.method,
              url: req.url,
            }),
          },
        },
      }),
    }),

    // ── Base de Datos (TypeORM) ────────────────────────────────────
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        database: config.get<string>('database.name'),
        username: config.get<string>('database.user'),
        password: config.get<string>('database.password'),
        schema: config.get<string>('database.schema'),
        entities: [__dirname + '/modules/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: config.get<string>('app.nodeEnv') === 'development',
        extra: {
          max: 10,
          min: 2,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    // ── Rate Limiting global (ThrottlerGuard como APP_GUARD) ──────
    // default: 100 req/min por IP — los endpoints críticos definen su propio @Throttle()
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: () => ({
        // 'default' coincide con el nombre usado en @Throttle({default: ...}) de los controllers
        throttlers: [{ name: 'default', ttl: 60000, limit: 100 }],
      }),
    }),

    // ── Redis global + BullMQ root ─────────────────────────────────
    RedisModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host') ?? 'localhost',
          port: config.get<number>('redis.port') ?? 6379,
          password: config.get<string>('redis.password') || undefined,
        },
      }),
    }),

    // ── Módulos funcionales ────────────────────────────────────────
    StorageModule,
    MetricsModule,
    HealthModule,
    ConfiguracionInstitucionalModule,
    AuthModule,
    UsuariosModule,
    CiudadanosModule,
    MotocicletasModule,
    MotivosModule,
    SolicitudesModule,
    PermisosModule,
    NotificacionesModule,
    AuditoriaModule,
    DependenciasModule,
    ReportesModule,
  ],
  providers: [
    // ── Guards globales ────────────────────────────────────────────
    // Orden: JwtAuthGuard valida el token (o lo omite en rutas @Public()).
    // RolesGuard verifica el rol requerido por @Roles() sobre req.user.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(CorrelationIdMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
