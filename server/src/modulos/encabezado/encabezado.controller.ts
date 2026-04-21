// src/modulos/encabezado/encabezado.controller.ts
import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { EncabezadoService } from './encabezado.service';
import { ActualizarPerfilDto } from './dto/actualizar.perfil.dto';
import { ActualizarWallpaperDto } from './dto/actualizar-wallpaper.dto';
import { ActualizarColoresDto } from './dto/actualizar-colores.dto';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { UsuarioActual } from '../../compartido/decoradores/usuario-actual.decorador';
import { configuracionSubida, configuracionSubidaMemoria } from '../../compartido/utilidades/archivos.utilidad';

@Controller('encabezado')
@UseGuards(AutenticacionGuardia)
export class EncabezadoController {
  constructor(private readonly encabezadoService: EncabezadoService) {}

  // ============================================================
  // GET /api/encabezado/perfil
  // ============================================================
  @Get('perfil')
  async obtenerPerfil(@UsuarioActual('id_persona') idUsuario: number) {
    return this.encabezadoService.obtenerPerfil(idUsuario);
  }

  // ============================================================
  // PUT /api/encabezado/perfil
  // ============================================================
  @Put('perfil')
  async actualizarPerfil(
    @UsuarioActual('id_persona') idUsuario: number,
    @Body() datos: ActualizarPerfilDto,
  ) {
    return this.encabezadoService.actualizarPerfil(idUsuario, datos);
  }

  // ============================================================
  // POST /api/encabezado/perfil/foto
  // ============================================================
  @Post('perfil/foto')
  @UseInterceptors(FileInterceptor('foto', configuracionSubidaMemoria()))
  async actualizarFotoPerfil(
    @UsuarioActual('id_persona') idUsuario: number,
    @UploadedFile() archivo: Express.Multer.File,
    ) {
    if (!archivo) {
        return { error: 'No se subió ninguna imagen' };
    }
    return this.encabezadoService.actualizarFotoPerfil(idUsuario, archivo);
    }

  // ============================================================
  // PUT /api/encabezado/wallpaper
  // ============================================================
    @Put('wallpaper')
    @HttpCode(HttpStatus.OK)
    async actualizarWallpaper(
    @UsuarioActual('id_persona') idUsuario: number,
    @Body() datos: ActualizarWallpaperDto,
    ) {
    return this.encabezadoService.actualizarWallpaper(idUsuario, datos);
    }

  // ============================================================
  // DELETE /api/encabezado/wallpaper
  // ============================================================
    @Delete('wallpaper')
    @HttpCode(HttpStatus.OK)
    async eliminarWallpaper(@UsuarioActual('id_persona') idUsuario: number) {
    return this.encabezadoService.eliminarWallpaper(idUsuario);
    }

  // ============================================================
  // PUT /api/encabezado/colores
  // ============================================================
    @Put('colores')
    @HttpCode(HttpStatus.OK)
    async actualizarColores(
    @UsuarioActual('id_persona') idUsuario: number,
    @Body() datos: ActualizarColoresDto,
    ) {
    return this.encabezadoService.actualizarColores(idUsuario, datos);
    }
}