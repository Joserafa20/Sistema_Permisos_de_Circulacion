import { Global, Module } from '@nestjs/common';
import { MinioStorageAdapter } from './infrastructure/services/minio-storage.adapter';

/**
 * Módulo global de almacenamiento en MinIO.
 * @Global() — disponible para todos los módulos sin necesidad de importarlo explícitamente.
 * Gestiona dos buckets: pyp-permisos (PDFs) y pyp-documentos (adjuntos del ciudadano).
 */
@Global()
@Module({
  providers: [MinioStorageAdapter],
  exports: [MinioStorageAdapter],
})
export class StorageModule {}
