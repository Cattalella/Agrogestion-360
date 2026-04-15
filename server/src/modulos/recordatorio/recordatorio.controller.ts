// src/modulos/recordatorios/recordatorios.controller.ts
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RecordatoriosService } from './recordatorio.service';
import { CrearRecordatorioDto } from './dto/crear-recordatorio.dto';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { UsuarioActual } from '../../compartido/decoradores/usuario-actual.decorador';

@Controller('recordatorios')
@UseGuards(AutenticacionGuardia)
export class RecordatoriosController {
  constructor(private readonly recordatoriosService: RecordatoriosService) {}

  // ============================================================
  // GET /api/recordatorios
  // ============================================================
  @Get()
  async obtenerTodos(@UsuarioActual('id_persona') idUsuario: number) {
    return this.recordatoriosService.obtenerTodos(idUsuario);
  }

  // ============================================================
  // POST /api/recordatorios
  // ============================================================
  @Post()
  async crear(
    @UsuarioActual('id_persona') idUsuario: number,
    @Body() crearDto: CrearRecordatorioDto,
  ) {
    return this.recordatoriosService.crear(idUsuario, crearDto);
  }

  // ============================================================
  // POST /api/recordatorios/sincronizar
  // ============================================================
  @Post('sincronizar')
  @HttpCode(HttpStatus.OK)
  async sincronizar(@UsuarioActual('id_persona') idUsuario: number) {
    return this.recordatoriosService.sincronizar(idUsuario);
  }

  // ============================================================
  // PUT /api/recordatorios/:id/cumplido
  // ============================================================
  @Put(':id/cumplido')
  @HttpCode(HttpStatus.OK)
  async marcarCumplido(
    @UsuarioActual('id_persona') idUsuario: number,
    @Param('id') idRecordatorio: string,
  ) {
    return this.recordatoriosService.marcarCumplido(idUsuario, idRecordatorio);
  }

  // ============================================================
  // DELETE /api/recordatorios/:id
  // ============================================================
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async eliminar(
    @UsuarioActual('id_persona') idUsuario: number,
    @Param('id') idRecordatorio: string,
  ) {
    return this.recordatoriosService.eliminar(idUsuario, idRecordatorio);
  }
}