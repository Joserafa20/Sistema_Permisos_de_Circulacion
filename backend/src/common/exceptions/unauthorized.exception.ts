import { DomainException } from './domain.exception';

export class UnauthorizedException extends DomainException {
  constructor(message = 'No autorizado', code = 'UNAUTHORIZED') {
    super(message, code, 401);
  }
}
