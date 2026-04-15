// src/compartido/filtros/excepcion-global.filtro.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class ExcepcionGlobalFiltro implements ExceptionFilter {
  private readonly logger = new Logger(ExcepcionGlobalFiltro.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let mensaje = 'Error interno del servidor';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const respuesta = exception.getResponse();
      mensaje = typeof respuesta === 'string' ? respuesta : (respuesta as any).message || mensaje;
    }

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${mensaje}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      mensaje,
    });
  }
}