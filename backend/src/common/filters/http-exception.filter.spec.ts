import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';
import { BusinessRuleException } from '../exceptions/business-rule.exception';
import { NotFoundException } from '../exceptions/not-found.exception';

function buildHost(method = 'GET', url = '/api/v1/test'): ArgumentsHost {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status } as unknown as import('express').Response;
  const request = { method, url } as import('express').Request;

  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => request,
    }),
  } as unknown as ArgumentsHost;
}

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let loggerWarnSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maneja DomainException con su httpStatus y código propio', () => {
    const host = buildHost();
    const exc = new BusinessRuleException('Regla de negocio violada', 'RN_X');
    filter.catch(exc, host);

    const ctx = host.switchToHttp();
    const responseMock = ctx.getResponse<{ status: jest.Mock; json?: jest.Mock }>();
    expect(responseMock.status).toHaveBeenCalledWith(exc.httpStatus);
  });

  it('responde 422 para BusinessRuleException', () => {
    const host = buildHost();
    const exc = new BusinessRuleException('Fecha inválida', 'FECHA_INVALIDA');
    filter.catch(exc, host);

    const ctx = host.switchToHttp();
    const responseMock = ctx.getResponse<{ status: jest.Mock }>();
    expect(responseMock.status).toHaveBeenCalledWith(422);
  });

  it('responde 404 para NotFoundException', () => {
    const host = buildHost();
    const exc = new NotFoundException('Recurso no encontrado', 'RECURSO_NO_ENCONTRADO');
    filter.catch(exc, host);

    const ctx = host.switchToHttp();
    const responseMock = ctx.getResponse<{ status: jest.Mock }>();
    expect(responseMock.status).toHaveBeenCalledWith(404);
  });

  it('maneja HttpException estándar de NestJS', () => {
    const host = buildHost();
    const exc = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    filter.catch(exc, host);

    const ctx = host.switchToHttp();
    const responseMock = ctx.getResponse<{ status: jest.Mock }>();
    expect(responseMock.status).toHaveBeenCalledWith(403);
  });

  it('maneja errores desconocidos como 500', () => {
    const host = buildHost();
    const exc = new Error('Error interno inesperado');
    filter.catch(exc, host);

    const ctx = host.switchToHttp();
    const responseMock = ctx.getResponse<{ status: jest.Mock }>();
    expect(responseMock.status).toHaveBeenCalledWith(500);
    expect(loggerErrorSpy).toHaveBeenCalled();
  });

  it('incluye success:false en el cuerpo de la respuesta', () => {
    const exc = new HttpException('Not found', HttpStatus.NOT_FOUND);

    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const customHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusFn }),
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exc, customHost);

    expect(jsonFn).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, timestamp: expect.any(String) }),
    );
  });

  it('no expone stack trace en la respuesta al cliente', () => {
    const exc = new Error('Error con stack');

    const jsonFn = jest.fn();
    const statusFn = jest.fn().mockReturnValue({ json: jsonFn });
    const customHost = {
      switchToHttp: () => ({
        getResponse: () => ({ status: statusFn }),
        getRequest: () => ({ method: 'GET', url: '/test' }),
      }),
    } as unknown as ArgumentsHost;

    filter.catch(exc, customHost);

    const responseBody = jsonFn.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(JSON.stringify(responseBody)).not.toContain('at ');
  });

  it('usa logger.warn para errores 4xx (no 5xx)', () => {
    const host = buildHost();
    const exc = new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
    filter.catch(exc, host);

    expect(loggerWarnSpy).toHaveBeenCalled();
    expect(loggerErrorSpy).not.toHaveBeenCalled();
  });
});
