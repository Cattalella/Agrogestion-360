import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AutenticacionService } from './autenticacion.service';
import { LoginDto } from './dto/login.dto';
import { RecuperarContrasenaDto, SolicitarRecuperacionDto, RestablecerContrasenaDto } from './dto/recuperar-contrasena.dto';
import { CambiarContrasenaDto } from './dto/cambiar-contrasena.dto';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';
import { UsuarioActual } from '../../compartido/decoradores/usuario-actual.decorador';

@Controller('autenticacion')
export class AutenticacionController {
  constructor(private readonly autenticacionService: AutenticacionService) {}

  // ============================================================
  // POST /api/autenticacion/iniciar-sesion
  // ============================================================
  @Post('iniciar-sesion')
  @HttpCode(HttpStatus.OK)
  async iniciarSesion(@Body() loginDto: LoginDto) {
    return this.autenticacionService.iniciarSesion(loginDto);
  }

  // ============================================================
  // 🆕 POST /api/autenticacion/solicitar-recuperacion (PASO 1 - Solo email)
  // ============================================================
  @Post('solicitar-recuperacion')
  @HttpCode(HttpStatus.OK)
  async solicitarRecuperacion(@Body() body: any) {
    console.log('📧 solicitud recibida:', body);
    return this.autenticacionService.solicitarRecuperacion(body.email);
  }

  // ============================================================
  // 🆕 POST /api/autenticacion/restablecer-contrasena (PASO 2 - Con token)
  // ============================================================
  @Post('restablecer-contrasena')
  @HttpCode(HttpStatus.OK)
  async restablecerContrasena(@Body() body: any) {
    console.log('🔑 Restableciendo contraseña:', { email: body.email, token: body.token });
    return this.autenticacionService.restablecerContrasena(
      body.email,
      body.token,
      body.nueva_contrasena,
    );
  }

  // ============================================================
  // (MANTENIDO PARA COMPATIBILIDAD CON VERSIONES ANTERIORES)
  // POST /api/autenticacion/recuperar-contrasena
  // ============================================================
  @Post('recuperar-contrasena')
  @HttpCode(HttpStatus.OK)
  async recuperarContrasena(@Body() recuperarDto: RecuperarContrasenaDto) {
    return this.autenticacionService.solicitarRecuperacionOld(
      recuperarDto.email,
      recuperarDto.nueva_contrasena,
    );
  }

  // ============================================================
  // (MANTENIDO PARA COMPATIBILIDAD CON VERSIONES ANTERIORES)
  // GET /api/autenticacion/confirmar-reset
  // ============================================================
  @Get('confirmar-reset')
  async confirmarRecuperacion(
    @Query('email') email: string,
    @Query('token') token: string,
  ) {
    return this.autenticacionService.confirmarRecuperacion(email, token);
  }

  // ============================================================
  // POST /api/autenticacion/cambiar-contrasena (Usuario logueado)
  // ============================================================
  @Post('cambiar-contrasena')
  @UseGuards(AutenticacionGuardia)
  @HttpCode(HttpStatus.OK)
  async cambiarContrasena(
    @UsuarioActual('id_persona') idUsuario: number,
    @Body() cambiarDto: CambiarContrasenaDto,
  ) {
    return this.autenticacionService.cambiarContrasena(
      idUsuario,
      cambiarDto.contrasena_actual,
      cambiarDto.nueva_contrasena,
    );
  }

  // ============================================================
  // POST /api/autenticacion/cerrar-sesion
  // ============================================================
  @Post('cerrar-sesion')
  @UseGuards(AutenticacionGuardia)
  @HttpCode(HttpStatus.OK)
  async cerrarSesion(@UsuarioActual('id_persona') idUsuario: number) {
    return this.autenticacionService.cerrarSesion(idUsuario);
  }

  // ============================================================
  // GET /api/autenticacion/validar-token
  // ============================================================
  @Get('validar-token')
  @UseGuards(AutenticacionGuardia)
  async validarToken(@UsuarioActual('id_persona') idUsuario: number) {
    return this.autenticacionService.validarToken(idUsuario);
  }

  // ============================================================
  // POST /api/autenticacion/registrar-administrador
  // ============================================================
  @Post('registrar-administrador')
  @UseGuards(AutenticacionGuardia, RolesGuardia)
  @Roles('Dueño')
  @HttpCode(HttpStatus.CREATED)
  async registrarAdministrador(
    @UsuarioActual('id_persona') idDueno: number,
    @Body() datos: any
  ) {
    return this.autenticacionService.crearAdministrador(datos, idDueno);
  }

  // ============================================================
  // POST /api/autenticacion/solicitar-recuperacion-supabase
  // ============================================================
  @Post('solicitar-recuperacion-supabase')
  async solicitarRecuperacionSupabase(@Body('email') email: string) {
    return this.autenticacionService.solicitarRecuperacionSupabase(email);
  }

  // ============================================================
  // POST /api/autenticacion/actualizar-contrasena-supabase
  // ============================================================
  @Post('actualizar-contrasena-supabase')
  async actualizarContrasenaSupabase(
    @Body('accessToken') accessToken: string,
    @Body('nuevaContrasena') nuevaContrasena: string,
  ) {
    return this.autenticacionService.actualizarContrasenaSupabase(
      accessToken,
      nuevaContrasena,
    );
  }
}