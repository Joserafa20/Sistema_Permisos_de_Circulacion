import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class CodigoPermisoService {
  constructor(private readonly dataSource: DataSource) {}

  /**
   * RN-07: número de permiso único e irrepetible usando secuencia PostgreSQL.
   * Formato: YYYY-PYP-NNNNN (ej: 2026-PYP-00145).
   */
  async generar(): Promise<string> {
    const result = await this.dataSource.query<{ codigo: string }[]>(
      `SELECT EXTRACT(YEAR FROM NOW())::text || '-PYP-' || LPAD(nextval('seq_codigo_permiso')::text, 5, '0') AS codigo`,
    );
    return result[0].codigo;
  }
}
