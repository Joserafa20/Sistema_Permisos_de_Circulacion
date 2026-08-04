export class Token {
  id: string;
  tokenHash: string;
  tipo: string;
  expiraAt: Date;
  revocado: boolean;
  revocadoAt: Date | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  usuarioId: string;
}
