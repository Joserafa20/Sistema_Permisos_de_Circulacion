import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import {
  IPermisoRepository,
  PERMISO_REPOSITORY_TOKEN,
} from '../../domain/ports/permiso-repository.interface';
import { QrCodeService } from '../../infrastructure/services/qr-code.service';
import { CodigoPermisoService } from '../../infrastructure/services/codigo-permiso.service';
import { PdfGeneratorService } from '../../infrastructure/services/pdf-generator.service';
import { MinioStorageAdapter } from '../../infrastructure/services/minio-storage.adapter';
import { AuditoriaService } from '../../../auditoria/application/auditoria.service';
import { SolicitudEntity } from '../../../solicitudes/infrastructure/persistence/solicitud.entity';
import { ConfiguracionInstitucionalEntity } from '../../../configuracion-institucional/infrastructure/persistence/configuracion-institucional.entity';
import { AccionAuditoria, EstadoPermiso } from '../../../../common/enums';
import { NotFoundException } from '../../../../common/exceptions/not-found.exception';
import { BusinessRuleException } from '../../../../common/exceptions/business-rule.exception';
import { PermisoGeneradoDto } from '../dtos/permiso-list-item.dto';
import type {
  SnapshotCiudadano,
  SnapshotMotocicleta,
  SnapshotMotivo,
} from '../../domain/entities/permiso.domain-entity';

@Injectable()
export class GenerarPermisoUseCase {
  private readonly publicUrl: string;
  private readonly bucketInstitucional: string;

  constructor(
    @Inject(PERMISO_REPOSITORY_TOKEN)
    private readonly permisoRepo: IPermisoRepository,
    private readonly qrCodeService: QrCodeService,
    private readonly codigoPermisoService: CodigoPermisoService,
    private readonly pdfGeneratorService: PdfGeneratorService,
    private readonly storageAdapter: MinioStorageAdapter,
    private readonly auditoriaService: AuditoriaService,
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {
    this.publicUrl = this.configService.get<string>('app.publicUrl') ?? 'http://localhost:3001';
    this.bucketInstitucional =
      this.configService.get<string>('storage.bucketDocs') ?? 'pyp-documentos';
  }

  /**
   * Genera el permiso completo para una solicitud aprobada:
   * 1. Carga solicitud con todas sus relaciones (snapshot inmutable — RN-06)
   * 2. Genera codigoQr opaco (RN-05)
   * 3. Genera imagen QR para el PDF
   * 4. Obtiene codigoPermiso de la secuencia PostgreSQL (RN-07)
   * 5. Descarga escudo institucional
   * 6. Genera PDF escarapela en memoria
   * 7. Calcula hash SHA-256 del PDF (RN-33)
   * 8. Sube PDF a MinIO
   * 9. Persiste permiso en DB
   * 10. Registra auditoría
   */
  async ejecutar(
    solicitudId: string,
    funcionarioId: string,
    ipAddress: string | null,
    condicionesRestricciones: string | null = null,
  ): Promise<PermisoGeneradoDto> {
    // ── 1. Cargar solicitud con relaciones ────────────────────────────
    const solicitud = await this.dataSource.getRepository(SolicitudEntity).findOne({
      where: { id: solicitudId },
      relations: ['ciudadano', 'motocicleta', 'motivo'],
    });

    if (!solicitud) {
      throw new NotFoundException(
        'Solicitud no encontrada para generar permiso',
        'SOLICITUD_NO_ENCONTRADA',
      );
    }

    // ── 2. Snapshots inmutables (RN-06) ──────────────────────────────
    const snapshotCiudadano: SnapshotCiudadano = {
      tipoDocumento: solicitud.ciudadano.tipoDocumento,
      numeroDocumento: solicitud.ciudadano.numeroDocumento,
      nombre: solicitud.ciudadano.nombre,
      apellido: solicitud.ciudadano.apellido,
      celular: solicitud.ciudadano.celular,
      email: solicitud.ciudadano.email,
    };

    const snapshotMotocicleta: SnapshotMotocicleta = {
      placa: solicitud.motocicleta.placa,
      marca: solicitud.motocicleta.marca,
      linea: solicitud.motocicleta.linea,
      modelo: solicitud.motocicleta.modelo,
      color: solicitud.motocicleta.color,
    };

    const snapshotMotivo: SnapshotMotivo = {
      nombre: solicitud.motivo.nombre,
    };

    // ── 3. UUID y código QR ───────────────────────────────────────────
    const permisoId = crypto.randomUUID();
    const codigoQr = this.qrCodeService.generarCodigoOpaco(permisoId);
    const verificationUrl = `${this.publicUrl}/api/v1/public/verificar/${codigoQr}`;
    const qrImageBuffer = await this.qrCodeService.generarImagenBuffer(verificationUrl);

    // ── 4. Consecutivo permiso (RN-07) ────────────────────────────────
    const codigoPermiso = await this.codigoPermisoService.generar();

    // ── 5. Configuración institucional ────────────────────────────────
    const ci = await this.dataSource
      .getRepository(ConfiguracionInstitucionalEntity)
      .findOne({ where: {} });

    if (!ci) {
      throw new BusinessRuleException(
        'No existe configuración institucional. Contacte al administrador.',
        'CONFIGURACION_INSTITUCIONAL_NO_ENCONTRADA',
      );
    }

    // Descargar escudo para el PDF
    let escudoBuffer: Buffer | null = null;
    try {
      escudoBuffer = await this.storageAdapter.download(
        this.bucketInstitucional,
        ci.escudoStorageKey,
      );
    } catch {
      throw new BusinessRuleException(
        'El escudo institucional no está disponible. No se puede generar el permiso.',
        'ESCUDO_NO_DISPONIBLE',
      );
    }

    // ── 6. Cargar datos del funcionario para el PDF ───────────────────
    const funcionarioResult = await this.dataSource.query<
      { nombre: string; apellido: string; dependencia_nombre: string | null }[]
    >(
      `SELECT u.nombre, u.apellido, d.nombre AS dependencia_nombre
       FROM usuarios u
       LEFT JOIN dependencias d ON d.id = u.dependencia_id
       WHERE u.id = $1`,
      [funcionarioId],
    );

    const funcionario = funcionarioResult[0] ?? {
      nombre: '',
      apellido: '',
      dependencia_nombre: 'Secretaría de Movilidad',
    };

    // ── 7. Generar PDF ────────────────────────────────────────────────
    const fechaExpedicion = new Date();

    const pdfBuffer = await this.pdfGeneratorService.generar({
      codigoPermiso,
      fechaExpedicion,
      fechaVencimiento: solicitud.fechaFin,
      snapshotCiudadano,
      snapshotMotocicleta,
      snapshotMotivo,
      condicionesRestricciones,
      funcionarioNombre: funcionario.nombre,
      funcionarioApellido: funcionario.apellido,
      funcionarioDependencia: funcionario.dependencia_nombre ?? 'Dependencia Municipal',
      qrImageBuffer,
      escudoBuffer,
      nombreAlcaldia: ci.nombreAlcaldia,
      municipio: ci.municipio,
      departamento: ci.departamento,
    });

    // ── 8. Hash PDF e integridad (RN-33) ──────────────────────────────
    const hashPdf = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    // ── 9. Subir PDF a MinIO ──────────────────────────────────────────
    const year = new Date().getFullYear();
    const storageKeyPdf = `permisos/${year}/${codigoPermiso}.pdf`;
    await this.storageAdapter.upload(
      this.storageAdapter.bucketPdfs,
      storageKeyPdf,
      pdfBuffer,
      'application/pdf',
    );

    // ── 10. Persistir permiso ─────────────────────────────────────────
    const permiso = await this.permisoRepo.crear({
      id: permisoId,
      codigoPermiso,
      solicitudId,
      funcionarioId,
      codigoQr,
      storageKeyPdf,
      fechaExpedicion,
      fechaVencimiento: solicitud.fechaFin,
      estado: EstadoPermiso.VIGENTE,
      snapshotCiudadano,
      snapshotMotocicleta,
      snapshotMotivo,
      condicionesRestricciones,
      hashPdf,
    });

    // ── 11. Auditoría (fire-and-forget) ───────────────────────────────
    void this.auditoriaService.registrar({
      accion: AccionAuditoria.GENERAR_PERMISO,
      entidad: 'permisos',
      entidadId: permiso.id,
      datosAnteriores: null,
      datosNuevos: { codigoPermiso, solicitudId, estado: EstadoPermiso.VIGENTE },
      ipAddress,
      usuarioId: funcionarioId,
    });

    return {
      id: permiso.id,
      codigoPermiso: permiso.codigoPermiso,
      estado: permiso.estado,
      fechaVencimiento: permiso.fechaVencimiento,
      mensaje: 'Permiso generado exitosamente.',
    };
  }
}
