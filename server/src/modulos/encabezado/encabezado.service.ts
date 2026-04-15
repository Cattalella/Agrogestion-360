// src/modulos/encabezado/encabezado.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActualizarPerfilDto } from './dto/actualizar.perfil.dto';
import { ActualizarWallpaperDto } from './dto/actualizar-wallpaper.dto';
import { ActualizarColoresDto } from './dto/actualizar-colores.dto';

@Injectable()
export class EncabezadoService {
    constructor(private prisma: PrismaService) {}

  // ============================================================
  // OBTENER PERFIL COMPLETO
  // ============================================================
    async obtenerPerfil(idUsuario: number) {
    const persona = await this.prisma.persona.findUnique({
        where: { id_persona: idUsuario },
        select: {
        id_persona: true,
        nombre_completo: true,
        email: true,
        telefono: true,
        nombre_usuario: true,
        foto_perfil: true,
        wallpaper_url: true,
        color_titulo: true,
        color_subtitulo: true,
        },
    });

    if (!persona) {
        throw new NotFoundException('Usuario no encontrado');
    }

    return {
        id: persona.id_persona,
        nombre: persona.nombre_completo,
        email: persona.email,
        telefono: persona.telefono,
        usuario: persona.nombre_usuario,
        foto_perfil: persona.foto_perfil,
        wallpaper_url: persona.wallpaper_url,
        color_titulo: persona.color_titulo || '#000000',
        color_subtitulo: persona.color_subtitulo || '#000000',
    };
    }

  // ============================================================
  // ACTUALIZAR PERFIL (email, teléfono)
  // ============================================================
    async actualizarPerfil(idUsuario: number, datos: ActualizarPerfilDto) {
    const persona = await this.prisma.persona.update({
        where: { id_persona: idUsuario },
        data: {
        email: datos.email,
        telefono: datos.telefono,
        },
        select: {
        id_persona: true,
        email: true,
        telefono: true,
        },
    });

    return {
        mensaje: 'Perfil actualizado correctamente',
        usuario: persona,
    };
    }

  // ============================================================
  // ACTUALIZAR FOTO DE PERFIL
  // ============================================================
    async actualizarFotoPerfil(idUsuario: number, archivo: Express.Multer.File) {
    // Guardar la ruta del archivo
    const rutaFoto = `/archivos-subidos/perfiles/${archivo.filename}`;
    
    await this.prisma.persona.update({
        where: { id_persona: idUsuario },
        data: { foto_perfil: rutaFoto },
    });

    return {
        mensaje: 'Foto de perfil actualizada',
        foto_perfil: rutaFoto,
    };
    }

  // ============================================================
  // ACTUALIZAR WALLPAPER (Fondo personalizado)
  // ============================================================
    async actualizarWallpaper(idUsuario: number, datos: ActualizarWallpaperDto) {
    await this.prisma.persona.update({
        where: { id_persona: idUsuario },
        data: { wallpaper_url: datos.wallpaper_url },
    });

    return {
        mensaje: 'Fondo actualizado correctamente',
        wallpaper_url: datos.wallpaper_url,
    };
    }

  // ============================================================
  // ELIMINAR WALLPAPER (Restaurar original)
  // ============================================================
    async eliminarWallpaper(idUsuario: number) {
    await this.prisma.persona.update({
        where: { id_persona: idUsuario },
        data: { wallpaper_url: null },
    });

    return {
        mensaje: 'Fondo restaurado al original',
    };
    }

  // ============================================================
  // ACTUALIZAR COLORES DE TÍTULOS
  // ============================================================
    async actualizarColores(idUsuario: number, datos: ActualizarColoresDto) {
    const datosActualizar: any = {};
    if (datos.color_titulo) datosActualizar.color_titulo = datos.color_titulo;
    if (datos.color_subtitulo) datosActualizar.color_subtitulo = datos.color_subtitulo;

    await this.prisma.persona.update({
        where: { id_persona: idUsuario },
        data: datosActualizar,
    });

    return {
        mensaje: 'Colores actualizados correctamente',
        color_titulo: datos.color_titulo,
        color_subtitulo: datos.color_subtitulo,
        };
    }
}