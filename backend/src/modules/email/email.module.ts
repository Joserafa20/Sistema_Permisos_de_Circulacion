import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionInstitucionalEntity } from '../configuracion-institucional/infrastructure/persistence/configuracion-institucional.entity';
import { EMAIL_PROVIDER } from './domain/ports/email-provider.interface';
import { SmtpEmailProvider } from './infrastructure/providers/smtp-email.provider';
import { PlantillaEmailService } from './infrastructure/services/plantilla-email.service';

/**
 * Módulo de email.
 *
 * Expone:
 * - IEmailProvider (token EMAIL_PROVIDER) — contrato de envío de correos.
 *   Implementación actual: SmtpEmailProvider (Nodemailer).
 *   Para cambiar a SES/SendGrid: reemplazar el binding sin tocar ningún caso de uso.
 * - PlantillaEmailService — renderiza templates HTML con branding institucional.
 */
@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionInstitucionalEntity])],
  providers: [{ provide: EMAIL_PROVIDER, useClass: SmtpEmailProvider }, PlantillaEmailService],
  exports: [EMAIL_PROVIDER, PlantillaEmailService],
})
export class EmailModule {}
