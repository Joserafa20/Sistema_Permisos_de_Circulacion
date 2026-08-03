import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { HealthModule } from './modules/health/health.module';
import { ConfiguracionInstitucionalModule } from './modules/configuracion-institucional/configuracion-institucional.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    // ── Configuración global ───────────────────────────────────────
    // isGlobal: true permite inyectar ConfigService en cualquier módulo
    // sin necesidad de importar ConfigModule localmente.
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: false,
        abortEarly: false, // Reporta TODOS los errores de validación, no solo el primero
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
          // Nunca loguear campos sensibles
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
    // synchronize: false en todo momento. El esquema se gestiona
    // exclusivamente mediante migraciones en /database/migrations/.
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
          // Pool de conexiones
          max: 10,
          min: 2,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 5000,
        },
      }),
    }),

    // ── Módulos funcionales ────────────────────────────────────────
    HealthModule,
    ConfiguracionInstitucionalModule,
    AuthModule,
    // Los módulos de negocio se registran en sus fases correspondientes.
    // Fase 2: AuthModule, UsuariosModule
    // Fase 3: SolicitudesModule, DocumentosModule, CiudadanosModule
    // Fase 4: PermisosModule, QRModule, PDFModule, NotificacionesModule
    // Fase 7: ReportesModule, AuditoriaModule, ConfiguracionModule
  ],
})
export class AppModule {}
