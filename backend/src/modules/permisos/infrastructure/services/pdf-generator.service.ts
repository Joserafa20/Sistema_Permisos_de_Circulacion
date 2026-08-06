import { Injectable } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require('pdfkit') as typeof import('pdfkit');
import type {
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
  /** Genera el PDF institucional tipo escarapela en UNA sola hoja A4. */
  async generar(data: PdfPermisoData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];

      const doc = new PDFDocument({
        size: 'A4',
        margin: 28,
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
      const pageH = doc.page.height;
      const mg = 28;
      const cW = pageW - mg * 2;
      const colW = (cW - 8) / 2;
      let y = mg;

      // ── ENCABEZADO ──────────────────────────────────────────────
      const logoH = 56;
      if (data.escudoBuffer) {
        try {
          doc.image(data.escudoBuffer, mg, y, { height: logoH, fit: [logoH, logoH] });
        } catch {
          /* sin escudo */
        }
      }
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor('#1a3a5c')
        .text(data.nombreAlcaldia.toUpperCase(), mg + logoH + 8, y + 2, { width: cW - logoH - 8 });
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#555555')
        .text(`${data.municipio}, ${data.departamento}`, mg + logoH + 8, y + 17, {
          width: cW - logoH - 8,
        });
      doc
        .font('Helvetica')
        .fontSize(8)
        .fillColor('#888888')
        .text('Secretaría de Movilidad — Pico y Placa', mg + logoH + 8, y + 29, {
          width: cW - logoH - 8,
        });
      y += logoH + 6;

      doc
        .moveTo(mg, y)
        .lineTo(mg + cW, y)
        .strokeColor('#1a3a5c')
        .lineWidth(2)
        .stroke();
      y += 6;

      // ── TÍTULO ──────────────────────────────────────────────────
      doc
        .font('Helvetica-Bold')
        .fontSize(13)
        .fillColor('#1a3a5c')
        .text('PERMISO DE CIRCULACIÓN – PICO Y PLACA', mg, y, { width: cW, align: 'center' });
      y += 16;
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor('#555555')
        .text(`N° ${data.codigoPermiso}`, mg, y, { width: cW, align: 'center' });
      y += 6;
      doc
        .moveTo(mg, y)
        .lineTo(mg + cW, y)
        .strokeColor('#cccccc')
        .lineWidth(0.8)
        .stroke();
      y += 8;

      // ── TITULAR ─────────────────────────────────────────────────
      this.sH(doc, 'DATOS DEL TITULAR', mg, y, cW);
      y += 13;
      this.lV(
        doc,
        'Nombre completo',
        `${data.snapshotCiudadano.nombre} ${data.snapshotCiudadano.apellido}`,
        mg,
        y,
        colW,
      );
      this.lV(
        doc,
        'Tipo de documento',
        data.snapshotCiudadano.tipoDocumento,
        mg + colW + 8,
        y,
        colW,
      );
      y += 21;
      this.lV(doc, 'Número de documento', data.snapshotCiudadano.numeroDocumento, mg, y, colW);
      if (data.snapshotCiudadano.celular)
        this.lV(doc, 'Celular', data.snapshotCiudadano.celular, mg + colW + 8, y, colW);
      y += 21;

      // ── MOTOCICLETA ─────────────────────────────────────────────
      this.sH(doc, 'DATOS DE LA MOTOCICLETA', mg, y, cW);
      y += 13;
      this.lV(doc, 'Placa', data.snapshotMotocicleta.placa, mg, y, colW);
      this.lV(
        doc,
        'Marca / Línea',
        `${data.snapshotMotocicleta.marca ?? '—'} ${data.snapshotMotocicleta.linea ?? ''}`.trim(),
        mg + colW + 8,
        y,
        colW,
      );
      y += 21;
      this.lV(doc, 'Modelo (año)', String(data.snapshotMotocicleta.modelo ?? '—'), mg, y, colW);
      this.lV(doc, 'Color', data.snapshotMotocicleta.color ?? '—', mg + colW + 8, y, colW);
      y += 21;

      // ── PERIODO Y MOTIVO ─────────────────────────────────────────
      this.sH(doc, 'PERIODO Y MOTIVO', mg, y, cW);
      y += 13;
      this.lV(doc, 'Válido desde', this.fDateCOT(data.fechaExpedicion), mg, y, colW);
      this.lV(doc, 'Válido hasta', this.fDateStr(data.fechaVencimiento), mg + colW + 8, y, colW);
      y += 21;
      this.lV(doc, 'Motivo', data.snapshotMotivo.nombre, mg, y, cW);
      y += 21;

      // ── CONDICIONES ──────────────────────────────────────────────
      if (data.condicionesRestricciones) {
        doc.rect(mg, y, cW, 1.5).fill('#f0a000');
        y += 5;
        doc
          .font('Helvetica-Bold')
          .fontSize(8)
          .fillColor('#c05000')
          .text('⚠  CONDICIONES Y RESTRICCIONES', mg, y, { width: cW });
        y += 12;
        doc
          .font('Helvetica')
          .fontSize(8)
          .fillColor('#333333')
          .text(data.condicionesRestricciones, mg, y, { width: cW - 6 });
        y += doc.currentLineHeight() * 1.4 + 8;
      }

      // ── FIRMA Y QR (zona inferior fija) ──────────────────────────
      const qrSize = 78;
      const qrX = mg + cW - qrSize;
      const qrY = pageH - mg - qrSize - 20;
      const firmaLineY = qrY + 14;

      // Línea separadora
      doc
        .moveTo(mg, qrY - 8)
        .lineTo(mg + cW, qrY - 8)
        .strokeColor('#dddddd')
        .lineWidth(0.5)
        .stroke();

      // QR
      doc.image(data.qrImageBuffer, qrX, qrY, { width: qrSize, height: qrSize });
      doc
        .font('Helvetica')
        .fontSize(6.5)
        .fillColor('#999999')
        .text('Escanee para verificar', qrX - 8, qrY + qrSize + 2, {
          width: qrSize + 16,
          align: 'center',
        });

      // Firma
      doc
        .moveTo(mg, firmaLineY)
        .lineTo(mg + 170, firmaLineY)
        .strokeColor('#333333')
        .lineWidth(0.5)
        .stroke();
      doc
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .fillColor('#222222')
        .text(`${data.funcionarioNombre} ${data.funcionarioApellido}`, mg, firmaLineY + 4, {
          width: 210,
        });
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor('#555555')
        .text(data.funcionarioDependencia, mg, firmaLineY + 15, { width: 210 });
      doc
        .font('Helvetica')
        .fontSize(7.5)
        .fillColor('#555555')
        .text('Funcionario Autorizado', mg, firmaLineY + 26, { width: 210 });

      // Pie
      const fy = pageH - mg - 10;
      doc
        .moveTo(mg, fy - 4)
        .lineTo(mg + cW, fy - 4)
        .strokeColor('#cccccc')
        .lineWidth(0.4)
        .stroke();
      doc
        .font('Helvetica')
        .fontSize(6.5)
        .fillColor('#aaaaaa')
        .text(
          `Documento generado electrónicamente el ${this.fDateTime(data.fechaExpedicion)}. ` +
            'La validez puede verificarse escaneando el código QR.',
          mg,
          fy,
          { width: cW, align: 'center' },
        );

      doc.end();
    });
  }

  private sH(doc: PDFKit.PDFDocument, t: string, x: number, y: number, w: number): void {
    doc.rect(x, y, w, 13).fill('#1a3a5c');
    doc
      .font('Helvetica-Bold')
      .fontSize(8)
      .fillColor('#ffffff')
      .text(t, x + 5, y + 3, { width: w - 10 });
  }

  private lV(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string,
    x: number,
    y: number,
    w: number,
  ): void {
    doc
      .font('Helvetica-Bold')
      .fontSize(7)
      .fillColor('#666666')
      .text(label + ':', x, y, { width: w });
    doc
      .font('Helvetica')
      .fontSize(9.5)
      .fillColor('#111111')
      .text(value || '—', x, y + 8, { width: w });
  }

  private fDateCOT(date: Date): string {
    return new Intl.DateTimeFormat('es-CO', {
      timeZone: 'America/Bogota',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private fDateStr(dateStr: string): string {
    const [yr, mo, dy] = dateStr.split('-');
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(Number(yr), Number(mo) - 1, Number(dy)));
  }

  private fDateTime(date: Date): string {
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
