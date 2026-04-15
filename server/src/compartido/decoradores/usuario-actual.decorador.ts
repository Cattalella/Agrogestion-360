// src/compartido/decoradores/usuario-actual.decorador.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UsuarioActual = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const usuario = request.usuario;

    if (!usuario) {
      return null;
    }

    return data ? usuario[data] : usuario;
  },
);