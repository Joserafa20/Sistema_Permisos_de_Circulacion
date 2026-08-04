import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { TipoNotificacion } from '../../../../common/enums';
import { ConfiguracionInstitucionalEntity } from '../../../configuracion-institucional/infrastructure/persistence/configuracion-institucional.entity';

const TEMPLATE_MAP: Record<TipoNotificacion, string> = {
  [TipoNotificacion.SOLICITUD_RECIBIDA]: 'solicitud-recibida.html',
  [TipoNotificacion.APROBADA]: 'solicitud-aprobada.html',
  [TipoNotificacion.RECHAZADA]: 'solicitud-rechazada.html',
  [TipoNotificacion.CORRECCION]: 'correccion-requerida.html',
  [TipoNotificacion.SOLICITUD_VENCIDA]: 'solicitud-vencida.html',
  [TipoNotificacion.PERMISO_REVOCADO]: 'permiso-revocado.html',
  [TipoNotificacion.CORRECCION_ENVIADA]: 'correccion-enviada.html',
};

/**
 * Carga templates HTML desde disco, inyecta branding institucional + contexto.
 *
 * Cache TTL de 60 s en memoria para `configuracion_institucional` (singleton).
 * La invalidación Redis completa (RN-86) se implementa en un bloque posterior.
 */
@Injectable()
export class PlantillaEmailService implements OnModuleInit {
  private readonly logger = new Logger(PlantillaEmailService.name);
  private readonly templateCache = new Map<string, string>();
  private ciCache: ConfiguracionInstitucionalEntity | null = null;
  private ciCacheExpiry = 0;
  private templateBasePath!: string;

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(ConfiguracionInstitucionalEntity)
    private readonly ciRepo: Repository<ConfiguracionInstitucionalEntity>,
  ) {}

  onModuleInit(): void {
    const nodeEnv = this.config.get<string>('app.nodeEnv') ?? 'development';
    // dist/templates/ en producción · src/templates/ en desarrollo
    this.templateBasePath = path.resolve(
      process.cwd(),
      nodeEnv === 'production' ? 'dist' : 'src',
      'templates',
      'email',
    );
    this.logger.log(`Templates path: ${this.templateBasePath}`);
  }

  async renderizar(tipo: TipoNotificacion, contexto: Record<string, string>): Promise<string> {
    const ci = await this.obtenerCI();
    const portalUrl = this.config.get<string>('app.publicUrl') ?? '';

    const variables: Record<string, string> = {
      ...contexto,
      nombreAlcaldia: ci?.nombreAlcaldia ?? 'Alcaldía Municipal',
      municipio: ci?.municipio ?? '',
      departamento: ci?.departamento ?? '',
      direccion: ci?.direccion ?? '',
      telefono: ci?.telefono ?? '',
      correoInstitucional: ci?.correoInstitucional ?? '',
      portalUrl,
      anio: new Date().getFullYear().toString(),
    };

    const html = this.cargarTemplate(tipo);
    return this.reemplazarVariables(html, variables);
  }

  private cargarTemplate(tipo: TipoNotificacion): string {
    const nombre = TEMPLATE_MAP[tipo];
    if (this.templateCache.has(nombre)) {
      return this.templateCache.get(nombre)!;
    }
    const filePath = path.join(this.templateBasePath, nombre);
    const content = fs.readFileSync(filePath, 'utf8');
    this.templateCache.set(nombre, content);
    return content;
  }

  private reemplazarVariables(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
      const value = vars[key];
      if (value === undefined) return '';
      // Escape básico XSS para valores interpolados
      return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
    });
  }

  private async obtenerCI(): Promise<ConfiguracionInstitucionalEntity | null> {
    if (this.ciCache && Date.now() < this.ciCacheExpiry) return this.ciCache;
    this.ciCache = await this.ciRepo.findOne({ where: {} });
    this.ciCacheExpiry = Date.now() + 60_000;
    return this.ciCache;
  }
}
