import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  constructor(message = 'Recurso no encontrado', code = 'NOT_FOUND') {
    super(message, code, 404);
  }
}
