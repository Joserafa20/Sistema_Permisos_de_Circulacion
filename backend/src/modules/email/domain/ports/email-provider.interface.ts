export const EMAIL_PROVIDER = Symbol('EMAIL_PROVIDER');

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface IEmailProvider {
  enviar(params: SendEmailParams): Promise<void>;
}
