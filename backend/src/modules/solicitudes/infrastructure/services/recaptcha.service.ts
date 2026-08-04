import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as https from 'https';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';

@Injectable()
export class RecaptchaService {
  private readonly logger = new Logger(RecaptchaService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Valida el token reCAPTCHA v3 con Google. Si no hay secretKey configurada
   * (entorno de desarrollo), omite la validación y retorna score 1.0.
   *
   * Lanza BusinessRuleException si el score está por debajo del mínimo (RN-55).
   */
  async verificar(token: string): Promise<number> {
    const secretKey = this.configService.get<string>('recaptcha.secretKey');

    if (!secretKey) {
      this.logger.warn('RECAPTCHA_SECRET_KEY no configurada — validación omitida en desarrollo');
      return 1.0;
    }

    const score = await this.llamarSiteverify(secretKey, token);
    const minScore = this.configService.get<number>('recaptcha.minScore') ?? 0.5;

    if (score < minScore) {
      throw new BusinessRuleException(
        `Verificación reCAPTCHA fallida (score ${score} < mínimo ${minScore})`,
        'RECAPTCHA_SCORE_INSUFICIENTE',
      );
    }

    return score;
  }

  private llamarSiteverify(secretKey: string, token: string): Promise<number> {
    const body = `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`;

    return new Promise((resolve, reject) => {
      const req = https.request(
        {
          hostname: 'www.google.com',
          path: '/recaptcha/api/siteverify',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(body),
          },
        },
        (res) => {
          let data = '';
          res.on('data', (chunk: Buffer) => (data += chunk.toString()));
          res.on('end', () => {
            try {
              const parsed = JSON.parse(data) as { success: boolean; score?: number };
              resolve(parsed.score ?? 0);
            } catch {
              reject(new Error('Respuesta inválida de reCAPTCHA'));
            }
          });
        },
      );

      req.on('error', reject);
      req.write(body);
      req.end();
    });
  }
}
