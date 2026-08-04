import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class MinioStorageAdapter implements OnModuleInit {
  private client: Client;
  readonly bucketPdfs: string;
  readonly bucketDocs: string;

  constructor(private readonly config: ConfigService) {
    this.bucketPdfs = this.config.get<string>('storage.bucketPdfs') ?? 'pyp-permisos';
    this.bucketDocs = this.config.get<string>('storage.bucketDocs') ?? 'pyp-documentos';

    this.client = new Client({
      endPoint: this.config.get<string>('storage.endpoint') ?? 'localhost',
      port: this.config.get<number>('storage.port') ?? 9000,
      accessKey: this.config.get<string>('storage.accessKey') ?? '',
      secretKey: this.config.get<string>('storage.secretKey') ?? '',
      useSSL: this.config.get<boolean>('storage.useSsl') ?? false,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.ensureBucket(this.bucketPdfs);
    await this.ensureBucket(this.bucketDocs);
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      await this.client.makeBucket(bucket, 'us-east-1');
    }
  }

  async upload(bucket: string, key: string, buffer: Buffer, mimeType: string): Promise<string> {
    await this.client.putObject(bucket, key, buffer, buffer.length, {
      'Content-Type': mimeType,
    });
    return key;
  }

  async download(bucket: string, key: string): Promise<Buffer> {
    const stream = await this.client.getObject(bucket, key);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  /** TTL en segundos. Máx 7 días según MinIO. */
  async getSignedUrl(bucket: string, key: string, ttlSeconds: number): Promise<string> {
    return this.client.presignedGetObject(bucket, key, ttlSeconds);
  }

  /** Verifica conectividad con MinIO comprobando que el bucket principal existe. */
  async ping(): Promise<boolean> {
    return this.client.bucketExists(this.bucketPdfs);
  }
}
