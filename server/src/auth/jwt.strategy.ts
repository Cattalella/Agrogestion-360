import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
    super({
      // 1. Le decimos de dónde sacar el token (del encabezado "Authorization")
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        // 2. Usamos la MISMA llave que pusimos en el AuthModule
        secretOrKey: 'SUPER_SECRET_KEY_123', 
    });
    }

  // 3. Si el token es válido, NestJS mete estos datos en el objeto "request"
    async validate(payload: any) {
    return { 
        userId: payload.sub, 
        email: payload.email, 
        rol: payload.rol 
    };
    }
}