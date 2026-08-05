import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import {
  SnapshotCiudadano,
  SnapshotMotocicleta,
  SnapshotMotivo,
} from '../../domain/entities/permiso.domain-entity';

export interface PdfPermisoData {
  codigoPermiso: string;
  fechaExpedicion: Date;
  fechaVencimiento: string;
  snapshotCiudadano: SnapshotCiudadano;
  snapshotMotocicleta: SnapshotMotocicleta;
  snapshotMotivo: SnapshotMotivo;
  condicionesRestricciones: string | null;
  funcionarioNombre: string;
  funcionarioApellido: string;
  funcionarioDependencia: string;
  qrImageBuffer: Buffer;
  escudoBuffer: Buffer | null;
  nombreAlcaldia: string;
  municipio: string;
  departamento: string;
}

@Injectable()
export class PdfGeneratorService {
  /**
   * Genera el PDF institucional tipo escarapela.
   * Diseño: A4 portrait, plantilla única, preparado para múltiples alcaldías.
   * Snapshot inmutable — los datos provienen del momento de aprobación (RN-06).
   */
  async generar(data: PdfPermisoData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
        info: {
          Title: `Permiso de Circulación ${data.codigoPermiso}`,
          Author: data.nombreAlcaldia,
          Subject: 'Permiso de Circulación Pico y Placa',
          Creator: 'Sistema de Permisos de Circulación',
        },
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW = doc.page.width;
      const margin = 40;
      const contentW = pageW - margin * 2;

      // ── ENCABEZADO ─────────────────────────────────────────────────
      let headerY = margin;

      // Escudo (si está disponible)
      if (data.escudoBuffer) {
        try {
          doc.image(data.escudoBuffer, margin, headerY, { height: 70, fit: [70, 70] });
        } catch {
          // Si el escudo no es imagen válida, continuar sin él
        }
      }

      // Nombre de la alcaldía al lado del escudo
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#1a3a5c')
        .text(data.nombreAlcaldia.toUpperCase(), margin + 82, headerY + 5, {
          width: contentW - 82,
        });

      doc
        .font('Helvetica')
        .fontSize(10)
        .fillColor('#444444')
        .text(`${data.municipio}, ${data.departamento}`, margin + 82, headerY + 26, {
          width: contentW - 82,
        });

      headerY += 78;

      // Línea divisora institucional
      doc
        .moveTo(margin, headerY)
        .lineTo(margin + contentW, headerY)
        .strokeColor('#1a3a5c')
        .lineWidth(2)
        .stroke();
      headerY += 8;

      // ── TÍTULO ─────────────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#1a3a5c')
        .text('PERMISO DE CIRCULACIÓN – PICO Y PLACA', margin, headerY, {
          width: contentW,
          align: 'center',
        });
      headerY += 26;

      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#666666')
        .text(`N° ${data.codigoPermiso}`, margin, headerY, { width: contentW, align: 'center' });
      headerY += 10;

      doc
        .moveTo(margin, headerY)
        .lineTo(margin + contentW, headerY)
        .strokeColor('#cccccc')
        .lineWidth(1)
        .stroke();
      headerY += 14;

      // ── SECCIÓN TITULAR ────────────────────────────────────────────
      this.sectionTitle(doc, 'DATOS DEL TITULAR', margin, headerY, contentW);
      headerY += 18;

      const colW = (contentW - 10) / 2;

      this.labelValue(
        doc,
        'Nombre completo',
        `${data.snapshotCiudadano.nombre} ${data.snapshotCiudadano.apellido}`,
        margin,
        headerY,
        colW,
      );
      this.labelValue(
        doc,
        'Tipo de documento',
        data.snapshotCiudadano.tipoDocumento,
        margin + colW + 10,
        headerY,
        colW,
      );
      headerY += 28;

      this.labelValue(
        doc,
        'Número de documento',
        data.snapshotCiudadano.numeroDocumento,
        margin,
        headerY,
        colW,
      );
      if (data.snapshotCiudadano.celular) {
        this.labelValue(
          doc,
          'Celular',
          data.snapshotCiudadano.celular,
          margin + colW + 10,
          headerY,
          colW,
        );
      }
      headerY += 28;

      // ── SECCIÓN MOTOCICLETA ─────────────────────────────────────────
      this.sectionTitle(doc, 'DATOS DE LA MOTOCICLETA', margin, headerY, contentW);
      headerY += 18;

      this.labelValue(doc, 'Placa', data.snapshotMotocicleta.placa, margin, headerY, colW);
      this.labelValue(
        doc,
        'Marca / Línea',
        `${data.snapshotMotocicleta.marca ?? '—'} ${data.snapshotMotocicleta.linea ?? ''}`.trim(),
        margin + colW + 10,
        headerY,
        colW,
      );
      headerY += 28;

      this.labelValue(
        doc,
        'Modelo (año)',
        String(data.snapshotMotocicleta.modelo ?? '—'),
        margin,
        headerY,
        colW,
      );
      this.labelValue(
        doc,
        'Color',
        data.snapshotMotocicleta.color ?? '—',
        margin + colW + 10,
        headerY,
        colW,
      );
      headerY += 28;

      // ── SECCIÓN PERIODO Y MOTIVO ────────────────────────────────────
      this.sectionTitle(doc, 'PERIODO Y MOTIVO', margin, headerY, contentW);
      headerY += 18;

      const fechaInicioLabel = this.formatDateCOT(data.fechaExpedicion);
      this.labelValue(doc, 'Válido desde', fechaInicioLabel, margin, headerY, colW);
      this.labelValue(
        doc,
        'Válido hasta',
        this.formatDateStr(data.fechaVencimiento),
        margin + colW + 10,
        headerY,
        colW,
      );
      headerY += 28;

      this.labelValue(doc, 'Motivo', data.snapshotMotivo.nombre, margin, headerY, contentW);
      headerY += 28;

      // ── CONDICIONES Y RESTRICCIONES ─────────────────────────────────
      if (data.condicionesRestricciones) {
        doc.rect(margin, headerY, contentW, 2).fill('#f0a000');
        headerY += 6;

        doc
          .font('Helvetica-Bold')
          .fontSize(9)
          .fillColor('#c05000')
          .text('⚠  CONDICIONES Y RESTRICCIONES', margin, headerY, { width: contentW });
        headerY += 14;

        doc
          .font('Helvetica')
          .fontSize(9)
          .fillColor('#333333')
          .text(data.condicionesRestricciones, margin, headerY, { width: contentW - 10 });
        headerY += doc.currentLineHeight() * 2 + 10;
      }

      // ── SECCIÓN FIRMA Y QR ─────────────────────────────────────────
      const bottomY = doc.page.height - margin - 90;
      if (headerY < bottomY - 10) headerY = bottomY - 10;

      // QR code (esquina inferior derecha)
      const qrSize = 90;
      const qrX = margin + contentW - qrSize;
      const qrY = doc.page.height - margin - qrSize - 10;

      doc.image(data.qrImageBuffer, qrX, qrY, { width: qrSize, height: qrSize });
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#888888')
        .text('Escanee para verificar', qrX - 10, qrY + qrSize + 2, {
          width: qrSize + 20,
          align: 'center',
        });

      // Firma del funcionario (izquierda)
      const firmaX = margin;
      const firmaY = doc.page.height - margin - 50;

      doc
        .moveTo(firmaX, firmaY)
        .lineTo(firmaX + 180, firmaY)
        .strokeColor('#333333')
        .lineWidth(0.5)
        .stroke();
      doc
        .font('Helvetica-Bold')
        .fontSize(9)
        .fillColor('#333333')
        .text(`${data.funcionarioNombre} ${data.funcionarioApellido}`, firmaX, firmaY + 4, {
          width: 200,
        });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#555555')
        .text(data.funcionarioDependencia, firmaX, firmaY + 16, { width: 220 });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#555555')
        .text('Funcionario Autorizado', firmaX, firmaY + 28, { width: 220 });

      // Pie de página
      const footerY = doc.page.height - margin - 14;
      doc
        .moveTo(margin, footerY - 4)
        .lineTo(margin + contentW, footerY - 4)
        .strokeColor('#cccccc')
        .lineWidth(0.5)
        .stroke();
      doc
        .font('Helvetica')
        .fontSize(7)
        .fillColor('#aaaaaa')
        .text(
          `Documento generado electrónicamente el ${this.formatDateTimeCOT(data.fechaExpedicion)}. ` +
            'La validez de este permiso puede verificarse escaneando el código QR.',
          margin,
          footerY,
          { width: contentW, align: 'center' },
        );

      doc.end();
    });
  }

  private sectionTitle(
    doc: PDFKit.PDFDocument,
    title: string,
    x: number,
    y: number,
    width: number,
  ): void {
    doc.rect(x, y, width, 16).fill('#1a3a5c');
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text(title, x + 6, y + 4, { width: width - 12 });
  }

  private labelValue(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    x: number,
    y: number,
    width: number,
  ): void {
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#666666')
      .text(label + ':', x, y, { width, continued: false });
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#111111')
      .text(value || '—', x, y + 10, { width });
  }

  private formatDateCOT(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private formatDateStr(dateStr: string): string {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  }

  private formatDateTimeCOT(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}
