import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import * as net from 'net';

@Injectable()
export class SmtpHealthIndicator extends HealthIndicator {
  constructor(private readonly config: ConfigService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const host = this.config.get<string>('mail.host') ?? 'localhost';
    const port = this.config.get<number>('mail.port') ?? 587;
    const reachable = await this.tcpProbe(host, port, 3000);
    return this.getStatus(
      key,
      reachable,
      reachable ? undefined : { message: `No se pudo conectar a ${host}:${port}` },
    );
  }

  private tcpProbe(host: string, port: number, timeoutMs: number): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const cleanup = (ok: boolean): void => {
        socket.destroy();
        resolve(ok);
      };
      socket.setTimeout(timeoutMs);
      socket.once('connect', () => cleanup(true));
      socket.once('error', () => cleanup(false));
      socket.once('timeout', () => cleanup(false));
      socket.connect(port, host);
    });
  }
}
