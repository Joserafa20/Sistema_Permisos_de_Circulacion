import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { MinioStorageAdapter } from '../../storage/infrastructure/services/minio-storage.adapter';

@Injectable()
export class MinioHealthIndicator extends HealthIndicator {
  constructor(private readonly minio: MinioStorageAdapter) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      // bucketExists hace una petición HEAD real al servidor MinIO
      await this.minio.ping();
      return this.getStatus(key, true);
    } catch {
      return this.getStatus(key, false, { message: 'No se pudo conectar a MinIO' });
    }
  }
}
