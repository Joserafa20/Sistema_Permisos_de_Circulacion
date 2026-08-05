import { Token } from '../entities/token.entity';

export const TOKEN_REPOSITORY_TOKEN = Symbol('ITokenRepository');

export interface ITokenRepository {
  findActiveRefreshByHash(hash: string): Promise<Token | null>;
  save(data: Omit<Token, 'id' | 'createdAt'>): Promise<void>;
  revoke(id: string): Promise<void>;
}
