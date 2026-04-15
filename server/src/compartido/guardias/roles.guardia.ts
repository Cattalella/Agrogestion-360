// src/compartido/guardias/roles.guardia.ts
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_CLAVE } from '../decoradores/roles.decorador';

@Injectable()
export class RolesGuardia implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>(ROLES_CLAVE, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const usuario = request.usuario;

    if (!usuario) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const tieneRol = rolesRequeridos.includes(usuario.nombre_rol);
    
    if (!tieneRol) {
      throw new ForbiddenException(
        `Se requiere uno de estos roles: ${rolesRequeridos.join(', ')}`
      );
    }

    return true;
  }
}