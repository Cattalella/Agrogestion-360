import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Ajusta la ruta si es necesario
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) {}

    async validarUsuario(email: string, pass: string) {
        // 1. Buscamos a la persona por su email e incluimos su rol
        const persona = await this.prisma.persona.findUnique({
            where: { email },
            include: { rol: true },
        });

        // 2. Si existe, comparamos la contraseña encriptada
        if (persona && persona.contrasena_hash) {
            const contraseñaValida = await bcrypt.compare(pass, persona.contrasena_hash);
            
            if (contraseñaValida) {
                // Sacamos la contraseña para no enviarla en el token
                const { contrasena_hash, ...resultado } = persona;
                return resultado;
            }
        }
        
        // 3. Si algo falla, lanzamos error de no autorizado
        throw new UnauthorizedException('Credenciales incorrectas');
    }

    async login(persona: any) {
        const payload = { 
            sub: persona.id_persona, 
            email: persona.email, 
            rol: persona.rol.nombre_rol 
        };
        
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                nombre: persona.nombre_completo,
                rol: persona.rol.nombre_rol
            }
        };
    }
}