import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // ── Logger ──────────────────────────────────────────────────────
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3001;
  const frontendUrl = config.get<string>('app.frontendUrl') ?? '';
  const nodeEnv = config.get<string>('app.nodeEnv') ?? 'development';

  // ── Prefijo global de rutas ──────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ── Seguridad HTTP (Helmet) ──────────────────────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production',
      crossOriginEmbedderPolicy: nodeEnv === 'production',
      hsts: nodeEnv === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
    }),
  );

  // ── CORS ─────────────────────────────────────────────────────────
  app.enableCors({
    origin: frontendUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ── Validación global de DTOs ────────────────────────────────────
  // whitelist: descarta propiedades no declaradas en el DTO.
  // forbidNonWhitelisted: retorna error 400 si el cliente envía propiedades extra.
  // transform: convierte los tipos automáticamente (string → number, etc.).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Filtro global de excepciones ─────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Interceptores globales ───────────────────────────────────────
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseTransformInterceptor());

  // ── Swagger / OpenAPI ────────────────────────────────────────────
  if (nodeEnv !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Sistema de Permisos de Circulación — API REST')
      .setDescription(
        'API para la gestión de permisos de circulación de motocicletas durante la restricción Pico y Placa. ' +
          'Referencia completa: docs/API_FUNCIONAL.md',
      )
      .setVersion('1.0')
      .setContact('Alcaldía — Área de Sistemas', '', '')
      .addBearerAuth(
        { type: 'http', scheme: 'bearer', bearerFormat: 'JWT', in: 'header' },
        'access-token',
      )
      .addTag('health', 'Estado del sistema')
      .addTag('auth', 'Autenticación y sesión')
      .addTag('usuarios', 'Gestión de usuarios internos')
      .addTag('solicitudes', 'Flujo de trámite de solicitudes')
      .addTag('permisos', 'Permisos de circulación generados')
      .addTag('documentos', 'Documentos soporte adjuntos')
      .addTag('motivos', 'Catálogo de motivos de solicitud')
      .addTag('dependencias', 'Dependencias de la Alcaldía')
      .addTag('configuracion', 'Parámetros del sistema')
      .addTag('auditoria', 'Bitácora de acciones')
      .addTag('reportes', 'Reportes y exportaciones')
      .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
    });
  }

  // ── Arranque ─────────────────────────────────────────────────────
  await app.listen(port);

  const appLogger = app.get(Logger);
  appLogger.log(`🚀 Backend corriendo en: http://localhost:${port}/api/v1`);
  if (nodeEnv !== 'production') {
    appLogger.log(`📖 Swagger UI en: http://localhost:${port}/api/docs`);
  }
  appLogger.log(`🌍 Entorno: ${nodeEnv}`);
}

bootstrap();
