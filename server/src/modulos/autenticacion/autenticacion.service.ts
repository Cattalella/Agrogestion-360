import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditoriaService } from '../auditoria/auditoria.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import * as nodemailer from 'nodemailer';
import { LoginDto } from './dto/login.dto';
import { generarPayloadToken } from '../../compartido/utilidades/jwt.utilidad';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AutenticacionService {
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditoria: AuditoriaService,
  ) {
    // Inicializar Supabase
    this.supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_ANON_KEY || '',
    );
  }

  // ============================================================
  // CONFIGURACIÓN DE NODEMAILER (MANTENIDO PARA COMPATIBILIDAD)
  // ============================================================
  private crearTransportador() {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  private async enviarCorreoRecuperacion(email: string, link: string) {
    const transporter = this.crearTransportador();

    await transporter.sendMail({
      from: `"Agrogestion 360" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Confirma tu cambio de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 32px; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h2 style="color: #15803d; text-align: center;">Agrogestion 360</h2>
          <p style="color: #374151;">Recibimos una solicitud para cambiar tu contraseña.</p>
          <p style="color: #374151;">Haz clic en el botón para confirmar el cambio:</p>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${link}"
              style="background-color: #15803d; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px; letter-spacing: 1px;">
              CONFIRMAR CAMBIO DE CONTRASEÑA
            </a>
          </div>

          <p style="color: #6b7280; font-size: 13px;">Este link expira en <strong>1 hora</strong>.</p>
          <p style="color: #6b7280; font-size: 13px;">Si no solicitaste este cambio, ignora este correo.</p>
        </div>
      `,
    });
  }

  // ============================================================
  // INICIAR SESIÓN
  // ============================================================
  async iniciarSesion(loginDto: LoginDto) {
    const { nombre_usuario, contrasena } = loginDto;

    const persona = await this.prisma.persona.findUnique({
      where: { nombre_usuario },
      include: {
        rol: true,
        estado: true,
      },
    });

    if (!persona) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (persona.estado.nombre !== 'Activo') {
      throw new UnauthorizedException('Usuario inactivo. Contacte al administrador');
    }

    const contrasenaValida = await bcrypt.compare(
      contrasena,
      persona.contrasena_hash || '',
    );

    if (!contrasenaValida) {
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    const payload = generarPayloadToken(persona);
    const token = this.jwtService.sign(payload);

    await this.auditoria.registrar({
      id_usuario: persona.id_persona,
      accion: 'LOGIN',
      descripcion: 'Inicio de sesión exitoso',
      entidad: 'Autenticacion',
      rol: persona.rol.nombre_rol,
    });

    return {
      token,
      usuario: {
        id: persona.id_persona,
        nombre: persona.nombre_completo,
        email: persona.email,
        telefono: persona.telefono,
        usuario: persona.nombre_usuario,
        rol: persona.rol.nombre_rol,
        foto_perfil: persona.foto_perfil,
        wallpaper_url: persona.wallpaper_url,
        color_titulo: persona.color_titulo || '#000000',
        color_subtitulo: persona.color_subtitulo || '#000000',
      },
    };
  }

  // ============================================================
  // RECUPERAR CONTRASEÑA CON NODEMAILER (MANTENIDO)
  // ============================================================
  async solicitarRecuperacion(email: string, nuevaContrasena: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!persona) {
      throw new BadRequestException('El correo electrónico no está registrado');
    }

    // Marcar tokens anteriores como usados
    await this.prisma.recuperacionClave.updateMany({
      where: {
        id_persona: persona.id_persona,
        usado: false,
      },
      data: {
        usado: true,
      },
    });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const nuevaClaveHash = await bcrypt.hash(nuevaContrasena, 10);

    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);

    await this.prisma.recuperacionClave.create({
      data: {
        id_persona: persona.id_persona,
        token_hash: tokenHash,
        nueva_contrasena_hash: nuevaClaveHash,
        fecha_expiracion: expiracion,
      },
    });

    const urlBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const linkConfirmacion = `${urlBase}/confirmar-reset?token=${token}&email=${email}`;

    await this.enviarCorreoRecuperacion(email, linkConfirmacion);

    console.log(`📧 Correo de recuperación enviado a: ${email}`);

    return {
      mensaje: 'Se ha enviado un link de confirmación a tu correo electrónico',
    };
  }

  // ============================================================
  // CONFIRMAR CAMBIO DE CONTRASEÑA CON NODEMAILER (MANTENIDO)
  // ============================================================
  async confirmarRecuperacion(email: string, token: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { email },
      include: { 
        tokens: {
          where: { 
            usado: false,
            fecha_expiracion: { gt: new Date() }
          }
        } 
      }
    });

    if (!persona || persona.tokens.length === 0) {
      throw new BadRequestException('No hay solicitudes de cambio pendientes o válidas para este correo');
    }

    let tokenValido: any = null;
    for (const t of persona.tokens) {
      const esCorrecto = await bcrypt.compare(token, t.token_hash);
      if (esCorrecto) {
        tokenValido = t;
        break;
      }
    }

    if (!tokenValido) {
      throw new BadRequestException('El link de confirmación es inválido o ha expirado');
    }

    await this.prisma.$transaction([
      this.prisma.persona.update({
        where: { id_persona: persona.id_persona },
        data: { contrasena_hash: tokenValido.nueva_contrasena_hash },
      }),
      this.prisma.recuperacionClave.update({
        where: { id_token: tokenValido.id_token },
        data: { usado: true },
      }),
    ]);

    await this.auditoria.registrar({
      id_usuario: persona.id_persona,
      accion: 'RESET_PASSWORD_CONFIRM',
      descripcion: 'Contraseña actualizada tras confirmación vía email',
      entidad: 'Autenticacion',
      rol: 'Usuario',
    });

    return {
      mensaje: '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.',
    };
  }

  // ============================================================
  // CAMBIAR CONTRASEÑA (MÚLTIPLES VECES AL DÍA)
  // ============================================================
  async cambiarContrasena(
    idUsuario: number,
    contrasenaActual: string,
    nuevaContrasena: string,
  ) {
    const persona = await this.prisma.persona.findUnique({
      where: { id_persona: idUsuario },
      include: { rol: true }
    });

    if (!persona) {
      throw new BadRequestException('Usuario no encontrado');
    }

    const contrasenaValida = await bcrypt.compare(
      contrasenaActual,
      persona.contrasena_hash || '',
    );

    if (!contrasenaValida) {
      throw new BadRequestException('Contraseña actual incorrecta');
    }

    const esMismaContrasena = await bcrypt.compare(nuevaContrasena, persona.contrasena_hash || '');
    if (esMismaContrasena) {
      throw new BadRequestException('La nueva contraseña debe ser diferente a la actual');
    }

    const nuevoHash = await bcrypt.hash(nuevaContrasena, 10);
    await this.prisma.persona.update({
      where: { id_persona: idUsuario },
      data: { contrasena_hash: nuevoHash },
    });

    await this.auditoria.registrar({
      id_usuario: idUsuario,
      accion: 'CAMBIO_CONTRASENA',
      descripcion: 'Contraseña actualizada por el usuario',
      entidad: 'Autenticacion',
      rol: persona.rol.nombre_rol,
    });

    return {
      mensaje: 'Contraseña actualizada correctamente',
    };
  }

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================
  async cerrarSesion(idUsuario: number) {
    if (idUsuario) {
      const persona = await this.prisma.persona.findUnique({
        where: { id_persona: idUsuario },
        include: { rol: true }
      });

      await this.auditoria.registrar({
        id_usuario: idUsuario,
        accion: 'LOGOUT',
        descripcion: 'Cierre de sesión',
        entidad: 'Autenticacion',
        rol: persona?.rol.nombre_rol || 'Desconocido',
      });
    }

    return {
      mensaje: 'Sesión cerrada correctamente',
    };
  }

  // ============================================================
  // VALIDAR TOKEN
  // ============================================================
  async validarToken(idUsuario: number) {
    const persona = await this.prisma.persona.findUnique({
      where: { id_persona: idUsuario },
      include: {
        rol: true,
        estado: true,
      },
    });

    if (!persona) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (persona.estado.nombre !== 'Activo') {
      throw new UnauthorizedException('Usuario inactivo');
    }

    return {
      valido: true,
      usuario: {
        id: persona.id_persona,
        nombre: persona.nombre_completo,
        email: persona.email,
        rol: persona.rol.nombre_rol,
      },
    };
  }

  // ============================================================
  // REGISTRAR ADMINISTRADOR
  // ============================================================
  async crearAdministrador(datos: any, idDueno: number) {
    const existente = await this.prisma.persona.findFirst({
      where: {
        OR: [
          { email: datos.email },
          { nombre_usuario: datos.nombre_usuario },
          { num_documento: datos.num_documento }
        ]
      }
    });

    if (existente) {
      throw new BadRequestException('El email, usuario o CC ya están registrados');
    }

    const rolAdmin = await this.prisma.rol.findUnique({
      where: { nombre_rol: 'Administrador' }
    });

    const hash = await bcrypt.hash(datos.contrasena || 'admin123', 10);

    const nuevaPersona = await this.prisma.persona.create({
      data: {
        nombre_completo: datos.nombre_completo,
        num_documento: datos.num_documento,
        email: datos.email,
        telefono: datos.telefono || null,
        nombre_usuario: datos.nombre_usuario,
        contrasena_hash: hash,
        id_rol: rolAdmin?.id_rol || 2,
        id_tipo_doc: parseInt(datos.id_tipo_doc || "1"),
        id_estado: 1,
      }
    });

    const dueno = await this.prisma.persona.findUnique({
      where: { id_persona: idDueno },
      include: { rol: true }
    });

    await this.auditoria.registrar({
      id_usuario: idDueno,
      accion: 'CREAR_ADMINISTRADOR',
      descripcion: `Creado administrador: ${nuevaPersona.nombre_usuario}`,
      entidad: 'Persona',
      rol: dueno?.rol.nombre_rol || 'Dueño',
    });

    return nuevaPersona;
  }

  // ============================================================
  // RECUPERAR CONTRASEÑA CON SUPABASE (NUEVO)
  // ============================================================
  async solicitarRecuperacionSupabase(email: string) {
    // 1. Verificar que el email existe en tu BD (Prisma)
    const persona = await this.prisma.persona.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!persona) {
      throw new BadRequestException('El correo electrónico no está registrado');
    }

    // 2. Usar Supabase para enviar el correo de restablecimiento
    const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/actualizar-contrasena`;
    
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      throw new BadRequestException('Error al enviar el correo: ' + error.message);
    }

    await this.auditoria.registrar({
      id_usuario: persona.id_persona,
      accion: 'SOLICITUD_RECUPERACION_SUPABASE',
      descripcion: `Solicitud de recuperación con Supabase para ${email}`,
      entidad: 'Autenticacion',
      rol: persona.rol?.nombre_rol || 'Usuario',
    });

    return {
      mensaje: 'Se ha enviado un link de recuperación a tu correo electrónico',
    };
  }

  // ============================================================
// ACTUALIZAR CONTRASEÑA CON SUPABASE (VERSIÓN CON ACCESS TOKEN)
// ============================================================
async actualizarContrasenaSupabase(accessToken: string, nuevaContrasena: string) {
  // 1. Establecer la sesión con el accessToken
  const { data: { user }, error: sessionError } = await this.supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: '', // No es necesario para este caso
  });

  if (sessionError) {
    throw new BadRequestException('Error al establecer sesión: ' + sessionError.message);
  }

  // 2. Actualizar la contraseña en Supabase
  const { error: updateError } = await this.supabase.auth.updateUser({
    password: nuevaContrasena
  });

  if (updateError) {
    throw new BadRequestException('Error al actualizar contraseña: ' + updateError.message);
  }

  // 3. También actualizar la contraseña en tu BD local (Prisma)
  if (user?.email) {
    const nuevaClaveHash = await bcrypt.hash(nuevaContrasena, 10);
    await this.prisma.persona.updateMany({
      where: { email: user.email },
      data: { contrasena_hash: nuevaClaveHash }
    });
  }

  // 4. Registrar en auditoría
  if (user?.email) {
    const persona = await this.prisma.persona.findUnique({
      where: { email: user.email },
      include: { rol: true }
    });

    if (persona) {
      await this.auditoria.registrar({
        id_usuario: persona.id_persona,
        accion: 'ACTUALIZAR_CONTRASENA_SUPABASE',
        descripcion: 'Contraseña actualizada vía Supabase',
        entidad: 'Autenticacion',
        rol: persona.rol?.nombre_rol || 'Usuario',
      });
    }
  }

  return {
    mensaje: 'Contraseña actualizada correctamente',
  };
}
}