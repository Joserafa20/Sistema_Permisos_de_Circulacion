import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { IEmailProvider, SendEmailParams } from '../../domain/ports/email-provider.interface';

/**
 * Proveedor SMTP real (Nodemailer).
 * En desarrollo puede apuntar a Mailhog cambiando las vars de entorno:
 *   MAIL_HOST=localhost MAIL_PORT=1025
 *
 * Para producción: cualquier servidor SMTP con TLS (SendGrid, SES, SMTP corporativo).
 * Para reemplazar el proveedor basta con crear otra clase que implemente IEmailProvider
 * y cambiar el binding en EmailModule — ningún caso de uso cambia.
 */
@Injectable()
export class SmtpEmailProvider implements IEmailProvider, OnModuleInit {
  private readonly logger = new Logger(SmtpEmailProvider.name);
  private transporter: Transporter;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const host = this.config.get<string>('mail.host');
    const port = this.config.get<number>('mail.port') ?? 587;
    const user = this.config.get<string>('mail.user');
    const pass = this.config.get<string>('mail.pass');

    this.logger.log(`SMTP configurado: host=${host} port=${port} user=${user}`);

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
    });

    // Verificar conexión SMTP al arrancar
    this.transporter.verify().then(
      () => this.logger.log('Conexión SMTP verificada correctamente'),
      (err: Error) =>
        this.logger.error(
          { error: err.message },
          'SMTP no disponible al arrancar — los emails no se enviarán hasta que se corrija',
        ),
    );
  }

  async enviar(params: SendEmailParams): Promise<void> {
    const from = this.config.get<string>('mail.from');
    const inicio = Date.now();

    const info = await this.transporter.sendMail({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      attachments: params.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType,
      })),
    });

    this.logger.log(
      {
        destinatario: params.to,
        asunto: params.subject,
        duracionMs: Date.now() - inicio,
        messageId: info.messageId,
      },
      'Email enviado',
    );
  }
}
