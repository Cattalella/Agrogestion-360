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
import { LoginDto } from './dto/login.dto';
import { generarPayloadToken } from '../../compartido/utilidades/jwt.utilidad';

@Injectable()
export class AutenticacionService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private auditoria: AuditoriaService,
  ) {}

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
  // RECUPERAR CONTRASEÑA (Solicitud Inicial)
  // ============================================================
  async solicitarRecuperacion(email: string, nuevaContrasena: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { email },
      include: { rol: true }
    });

    if (!persona) {
      throw new BadRequestException('El correo electrónico no está registrado');
    }

    // Generar Token seguro
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = await bcrypt.hash(token, 10);
    const nuevaClaveHash = await bcrypt.hash(nuevaContrasena, 10);
    
    // Expiración en 1 hora
    const expiracion = new Date();
    expiracion.setHours(expiracion.getHours() + 1);

    // Guardar en BD
    await this.prisma.recuperacionClave.create({
      data: {
        id_persona: persona.id_persona,
        token_hash: tokenHash,
        nueva_contrasena_hash: nuevaClaveHash,
        fecha_expiracion: expiracion
      }
    });

    // Simulación de envío de correo
    const linkConfirmacion = `http://localhost:5173/confirmar-reset?token=${token}&email=${email}`;
    
    console.log('\n============================================================');
    console.log(`📧 [EMAIL SIMULADO] A: ${email}`);
    console.log(`Acción: Confirmar cambio de contraseña`);
    console.log(`Link: ${linkConfirmacion}`);
    console.log('============================================================\n');

    return {
      mensaje: 'Se ha enviado un link de confirmación a tu correo electrónico',
      ...(process.env.NODE_ENV === 'development' && { link_debug: linkConfirmacion }),
    };
  }

  // ============================================================
  // CONFIRMAR CAMBIO DE CONTRASEÑA
  // ============================================================
  async confirmarRecuperacion(email: string, token: string) {
    const persona = await this.prisma.persona.findUnique({
      where: { email },
      include: { tokens: { where: { usado: false } } }
    });

    if (!persona || persona.tokens.length === 0) {
      throw new BadRequestException('No hay solicitudes de cambio pendientes para este correo');
    }

    // Buscar el token válido
    let tokenValido: any = null;
    for (const t of persona.tokens) {
      const esCorrecto = await bcrypt.compare(token, t.token_hash);
      const expirado = new Date() > t.fecha_expiracion;
      
      if (esCorrecto && !expirado) {
        tokenValido = t;
        break;
      }
    }

    if (!tokenValido) {
      throw new BadRequestException('El link de confirmación es inválido o ha expirado');
    }

    // Aplicar el cambio
    await this.prisma.$transaction([
      this.prisma.persona.update({
        where: { id_persona: persona.id_persona },
        data: { contrasena_hash: tokenValido.nueva_contrasena_hash }
      }),
      this.prisma.recuperacionClave.update({
        where: { id_token: tokenValido.id_token },
        data: { usado: true }
      })
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
  // CAMBIAR CONTRASEÑA
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
  // REGISTRAR ADMINISTRADOR (RF.1.1.1)
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
}