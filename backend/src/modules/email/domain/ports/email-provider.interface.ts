export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
}

export interface IEmailProvider {
  enviar(params: SendEmailParams): Promise<void>;
}
