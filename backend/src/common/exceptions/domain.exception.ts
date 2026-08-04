/**
 * Clase base para todas las excepciones de dominio.
 * Los use cases lanzan estas excepciones sin depender de @nestjs/common.
 * El HttpExceptionFilter las intercepta y las convierte a respuestas HTTP.
 */
export abstract class DomainException extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly httpStatus: number,
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
