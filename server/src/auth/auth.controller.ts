import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common'; // Añadimos Get, UseGuards y Req
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport'; // Este es el guardaespaldas oficial

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() loginDto: { email: string, contrasena: string }) {
        const persona = await this.authService.validarUsuario(loginDto.email, loginDto.contrasena);
        return this.authService.login(persona);
    }

    // --- ESTA ES LA NUEVA RUTA PROTEGIDA ---
    @UseGuards(AuthGuard('jwt')) // Aquí le decimos al policía que vigile esta puerta
    @Get('perfil')
    obtenerPerfil(@Req() req) {
        // Si el token es válido, los datos del Boss estarán en req.user
        return {
            mensaje: "Bienvenido a la zona privada de AgroGestión 360",
            datos: req.user
        };
    }
}