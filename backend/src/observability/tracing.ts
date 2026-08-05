/**
 * Instrumentación OpenTelemetry — Pico y Placa Backend
 *
 * CÓMO USAR:
 *   Este archivo debe importarse ANTES que cualquier módulo de NestJS.
 *   En producción, arrancar con:
 *
 *     node --require ./dist/observability/tracing.js dist/main.js
 *
 *   O bien, como primera línea de main.ts:
 *     import './observability/tracing';
 *
 * REQUISITO:
 *   Definir OTEL_EXPORTER_OTLP_ENDPOINT en variables de entorno.
 *   Si la variable no está definida, el tracing se desactiva silenciosamente.
 *
 * SERVICIOS INSTRUMENTADOS AUTOMÁTICAMENTE:
 *   - HTTP (express/nestjs)
 *   - TypeORM / pg (PostgreSQL)
 *   - Redis / ioredis
 *   - BullMQ (a través de ioredis)
 */

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';

const OTLP_ENDPOINT = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
const SERVICE_NAME = process.env.OTEL_SERVICE_NAME ?? 'pyp-backend';

// Si no hay endpoint configurado, no inicializar (dev/CI sin infraestructura de observabilidad)
if (!OTLP_ENDPOINT) {
  if (process.env.NODE_ENV !== 'test') {
    console.info('[OpenTelemetry] OTEL_EXPORTER_OTLP_ENDPOINT no definido — tracing desactivado');
  }
} else {
  const exporter = new OTLPTraceExporter({ url: `${OTLP_ENDPOINT}/v1/traces` });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: SERVICE_NAME }),
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
        '@opentelemetry/instrumentation-dns': { enabled: false },
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown().catch((err) => {
      console.error('[OpenTelemetry] Error al cerrar el SDK:', err);
    });
  });
}
