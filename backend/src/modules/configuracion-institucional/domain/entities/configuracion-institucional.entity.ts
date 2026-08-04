export class ConfiguracionInstitucional {
  id: string;
  nombreAlcaldia: string;
  nit: string;
  codigoDane: string;
  departamento: string;
  municipio: string;
  direccion: string;
  telefono: string;
  correoInstitucional: string;
  sitioWeb: string | null;
  escudoStorageKey: string;
  logoStorageKey: string | null;
  escudoHash: string | null;
  logoHash: string | null;
  updatedAt: Date | null;
  updatedById: string | null;
}
