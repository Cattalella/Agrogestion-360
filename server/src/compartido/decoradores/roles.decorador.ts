// src/compartido/decoradores/roles.decorador.ts
import { SetMetadata } from '@nestjs/common';

export const ROLES_CLAVE = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_CLAVE, roles);