import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';

@Injectable()
export class MinioStorageAdapter implements OnModuleInit {
  private readonly logger = new Logger(MinioStorageAdapter.name);
  private client: Client;
  readonly bucketPdfs: string;
  readonly bucketDocs: string;

  constructor(private readonly config: ConfigService) {
    this.bucketPdfs = this.config.get<string>('storage.bucketPdfs') ?? 'pyp-permisos';
    this.bucketDocs = this.config.get<string>('storage.bucketDocs') ?? 'pyp-documentos';

    const endpoint = this.config.get<string>('storage.endpoint') ?? 'localhost';
    const useSSL = this.config.get<boolean>('storage.useSsl') ?? false;

    // Cloudflare R2 usa puerto 443 implícito cuando useSSL=true y no se pasa port
    const portCfg = this.config.get<number>('storage.port');

    const clientOptions: ConstructorParameters<typeof Client>[0] = {
      endPoint: endpoint,
      accessKey: this.config.get<string>('storage.accessKey') ?? '',
      secretKey: this.config.get<string>('storage.secretKey') ?? '',
      useSSL,
      // R2 requiere pathStyle=false (virtual-hosted) y region 'auto'
      region: this.config.get<string>('storage.region') ?? 'auto',
    };

    // R2 con SSL usa 443; MinIO JS defaultea a 9000 si no se especifica puerto
    if (portCfg) {
      clientOptions.port = portCfg;
    } else {
      clientOptions.port = useSSL ? 443 : 80;
    }

    this.client = new Client(clientOptions);
  }

  async onModuleInit(): Promise<void> {
    // En R2 los buckets se crean desde el dashboard de Cloudflare; solo verificamos existencia
    await this.ensureBucket(this.bucketPdfs).catch((e: unknown) =>
      this.logger.warn(`bucket ${this.bucketPdfs}: ${String(e)}`),
    );
    await this.ensureBucket(this.bucketDocs).catch((e: unknown) =>
      this.logger.warn(`bucket ${this.bucketDocs}: ${String(e)}`),
    );
  }

  private async ensureBucket(bucket: string): Promise<void> {
    const exists = await this.client.bucketExists(bucket);
    if (!exists) {
      // Intenta crear el bucket; en R2 puede fallar si no tiene permisos — no es fatal
      await this.client.makeBucket(bucket, 'auto');
      this.logger.log(`Bucket creado: ${bucket}`);
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

  /** TTL en segundos. Máximo 300 s (5 min) según RN-78. */
  async getSignedUrl(bucket: string, key: string, ttlSeconds: number): Promise<string> {
    const safeTtl = Math.min(ttlSeconds, 300);
    return this.client.presignedGetObject(bucket, key, safeTtl);
  }

  /** Verifica conectividad con MinIO comprobando que el bucket principal existe. */
  async ping(): Promise<boolean> {
    return this.client.bucketExists(this.bucketPdfs);
  }
}
