import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  readonly registry: Registry;

  /** Conteo de peticiones HTTP por método, ruta y código de estado */
  readonly httpRequestsTotal: Counter<string>;

  /** Duración de peticiones HTTP en segundos */
  readonly httpRequestDurationSeconds: Histogram<string>;

  /** Trabajos BullMQ procesados */
  readonly bullmqJobsTotal: Counter<string>;

  /** Errores de BullMQ por cola */
  readonly bullmqJobErrorsTotal: Counter<string>;

  constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({ app: 'pyp-backend' });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total de peticiones HTTP recibidas',
      labelNames: ['method', 'route', 'status_code'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duración de peticiones HTTP en segundos',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.bullmqJobsTotal = new Counter({
      name: 'bullmq_jobs_processed_total',
      help: 'Total de trabajos BullMQ procesados',
      labelNames: ['queue', 'status'],
      registers: [this.registry],
    });

    this.bullmqJobErrorsTotal = new Counter({
      name: 'bullmq_job_errors_total',
      help: 'Total de trabajos BullMQ fallidos',
      labelNames: ['queue'],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
