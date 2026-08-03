import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ValidationError } from 'class-validator';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as compression from 'compression';
import { AppModule } from './app.module';
import { SWAGGER_BEARER_TOKEN } from './common/constants/swagger.constants';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  // ── Logger ──────────────────────────────────────────────────────
  app.useLogger(app.get(Logger));

  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3001;
  const frontendUrl = config.get<string>('app.frontendUrl') ?? '';
  const nodeEnv = config.get<string>('app.nodeEnv') ?? 'development';

  // ── Trust proxy (necesario para req.ip real detrás de nginx/load balancer) ─
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app.getHttpAdapter().getInstance() as any).set('trust proxy', 1);

  // ── Límite de cuerpo de solicitud ────────────────────────────────
  // Usar express.json/urlencoded con límite explícito (bodyParser deshabilitado en create()).
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const express = require('express') as typeof import('express');
  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  // ── Compresión HTTP (gzip/deflate) ───────────────────────────────
  app.use(compression());

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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const details = errors.map((err) => ({
          field: err.property,
          message: Object.values(err.constraints ?? {}).join('; '),
        }));
        return new BadRequestException({
          message: 'Los datos enviados no son válidos',
          code: 'VALIDATION_ERROR',
          errors: details,
        });
      },
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
        SWAGGER_BEARER_TOKEN,
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

void bootstrap();
