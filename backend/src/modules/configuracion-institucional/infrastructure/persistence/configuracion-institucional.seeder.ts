import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { ConfiguracionInstitucionalEntity } from './configuracion-institucional.entity';

/**
 * Seeder de configuracion_institucional.
 *
 * Inserta un registro inicial usando variables de entorno SEED_CI_* si la tabla
 * está vacía al arrancar. En despliegues posteriores no hace nada (tabla ocupada).
 * El administrador debe actualizar los valores desde el panel web después del
 * primer despliegue, especialmente escudo y logo.
 */
@Injectable()
export class ConfiguracionInstitucionalSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(ConfiguracionInstitucionalSeeder.name);

  constructor(
    @InjectRepository(ConfiguracionInstitucionalEntity)
    private readonly repo: Repository<ConfiguracionInstitucionalEntity>,
    private readonly config: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const count = await this.repo.count();
    if (count > 0) return;

    const nombreAlcaldia =
      this.config.get<string>('seed.ci.nombreAlcaldia') ?? 'Alcaldía Municipal';
    const municipio = this.config.get<string>('seed.ci.municipio') ?? 'Municipio';
    const departamento = this.config.get<string>('seed.ci.departamento') ?? 'Departamento';
    const direccion =
      this.config.get<string>('seed.ci.direccion') ?? 'Dirección pendiente de configurar';
    const telefono = this.config.get<string>('seed.ci.telefono') ?? '(000) 000 0000';
    const correoInstitucional =
      this.config.get<string>('seed.ci.correo') ?? 'alcaldia@municipio.gov.co';
    const sitioWeb = this.config.get<string>('seed.ci.sitioWeb') ?? null;
    const nit = this.config.get<string>('seed.ci.nit') ?? '000000000-0';
    const codigoDane = this.config.get<string>('seed.ci.codigoDane') ?? '00000';

    await this.repo.save(
      this.repo.create({
        nombreAlcaldia,
        nit,
        codigoDane,
        municipio,
        departamento,
        direccion,
        telefono,
        correoInstitucional,
        sitioWeb: sitioWeb || null,
        escudoStorageKey: '_placeholder_sin_escudo_',
        logoStorageKey: null,
        escudoHash: null,
        logoHash: null,
        updatedBy: null,
      }),
    );

    this.logger.log(
      `Configuración institucional inicializada para "${nombreAlcaldia}". ` +
        'Actualice el escudo y logo desde el panel de administración.',
    );
  }
}
