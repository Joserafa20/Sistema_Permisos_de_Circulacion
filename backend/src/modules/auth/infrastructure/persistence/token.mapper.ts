import { Token } from '../../domain/entities/token.entity';
import { TokenEntity } from './token.entity';

export class TokenMapper {
  static toDomain(entity: TokenEntity): Token {
    const token = new Token();
    token.id = entity.id;
    token.tokenHash = entity.tokenHash;
    token.tipo = entity.tipo;
    token.expiraAt = entity.expiraAt;
    token.revocado = entity.revocado;
    token.revocadoAt = entity.revocadoAt;
    token.ipAddress = entity.ipAddress;
    token.userAgent = entity.userAgent;
    token.createdAt = entity.createdAt;
    token.usuarioId = entity.usuario?.id ?? '';
    return token;
  }
}
