import { ConfiguracionInstitucional } from '../../domain/entities/configuracion-institucional.entity';
import { ConfiguracionInstitucionalEntity } from './configuracion-institucional.entity';
import { ConfiguracionInstitucionalResponseDto } from '../../application/use-cases/obtener-configuracion-institucional/configuracion-institucional-response.dto';

export class ConfiguracionInstitucionalMapper {
  static toDomain(entity: ConfiguracionInstitucionalEntity): ConfiguracionInstitucional {
    const domain = new ConfiguracionInstitucional();
    domain.id = entity.id;
    domain.nombreAlcaldia = entity.nombreAlcaldia;
    domain.nit = entity.nit;
    domain.codigoDane = entity.codigoDane;
    domain.departamento = entity.departamento;
    domain.municipio = entity.municipio;
    domain.direccion = entity.direccion;
    domain.telefono = entity.telefono;
    domain.correoInstitucional = entity.correoInstitucional;
    domain.sitioWeb = entity.sitioWeb;
    domain.escudoStorageKey = entity.escudoStorageKey;
    domain.logoStorageKey = entity.logoStorageKey;
    domain.escudoHash = entity.escudoHash;
    domain.logoHash = entity.logoHash;
    domain.updatedAt = entity.updatedAt;
    domain.updatedById = entity.updatedBy?.id ?? null;
    return domain;
  }

  static toResponseDto(domain: ConfiguracionInstitucional): ConfiguracionInstitucionalResponseDto {
    return {
      id: domain.id,
      nombreAlcaldia: domain.nombreAlcaldia,
      nit: domain.nit,
      codigoDane: domain.codigoDane,
      departamento: domain.departamento,
      municipio: domain.municipio,
      direccion: domain.direccion,
      telefono: domain.telefono,
      correoInstitucional: domain.correoInstitucional,
      sitioWeb: domain.sitioWeb,
      tieneEscudo: Boolean(domain.escudoStorageKey),
      tieneLogo: Boolean(domain.logoStorageKey),
      updatedAt: domain.updatedAt?.toISOString() ?? null,
    };
  }
}
