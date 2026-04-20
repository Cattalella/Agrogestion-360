import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode
} from '@nestjs/common';
import { TrabajadoresService } from './trabajadores.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { CrearPagoDto } from './dto/Crear-pago.dto';
import { ActualizarPagoDto } from './dto/Actualizarpago.dto';
import { CrearTrabajoDto } from './dto/Crear-trabajo.dto';
import { ActualizarTrabajoDto } from './dto/Actualizar-trabajo.dto';

@Controller('trabajadores')
@UseGuards(AutenticacionGuardia)
export class TrabajadoresController {
  constructor(private readonly trabajadoresService: TrabajadoresService) {}

  // ============================================================
  // 📌 ENDPOINTS TRABAJADORES
  // ============================================================

  @Get()
  async listarTrabajadores() {
    return this.trabajadoresService.listarTrabajadores();
  }

  @Post()
  async crearTrabajador(@Body() datos: any) {
    return this.trabajadoresService.crearTrabajador(datos);
  }

  @Patch(':id')
  async actualizarTrabajador(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: any
  ) {
    return this.trabajadoresService.actualizarTrabajador(id, datos);
  }

  @Post(':id/eliminar')
  @HttpCode(200)
  async eliminarTrabajador(@Param('id', ParseIntPipe) id: number) {
    return this.trabajadoresService.eliminarTrabajador(id);
  }

  // ============================================================
  // 📌 ENDPOINTS TRABAJO REALIZADO
  // ============================================================

  @Get('trabajos')
  async listarTrabajos() {
    return this.trabajadoresService.listarTrabajos();
  }

  @Post('trabajos')
  async registrarTrabajo(@Body() datos: CrearTrabajoDto) {
    return this.trabajadoresService.registrarTrabajo(datos);
  }

  @Put('trabajos/:id')
  async actualizarTrabajo(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarTrabajoDto
  ) {
    return this.trabajadoresService.actualizarTrabajo(id, datos);
  }

  @Delete('trabajos/:id')
  async eliminarTrabajo(
    @Param('id', ParseIntPipe) id: number,
    @Body('justificacion') justificacion?: string
  ) {
    return this.trabajadoresService.eliminarTrabajo(id, justificacion);
  }

  // ============================================================
  // 📌 ENDPOINTS PAGOS — RF.8.1.1
  // ============================================================

  @Get('pagos')
  async listarPagos() {
    return this.trabajadoresService.listarPagos();
  }

  @Get('pagos/:id')
  async obtenerPago(@Param('id', ParseIntPipe) id: number) {
    return this.trabajadoresService.obtenerPago(id);
  }

  @Post('pagos')
  async registrarPago(@Body() datos: CrearPagoDto) {
    return this.trabajadoresService.registrarPago(datos);
  }

  // RN.8.1.1: Solo editable si NO está anulado
  @Put('pagos/:id')
  async actualizarPago(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: ActualizarPagoDto
  ) {
    return this.trabajadoresService.actualizarPago(id, datos);
  }

  // RN.8.1.1: Anular con justificación — conserva historial
  @Patch('pagos/:id/anular')
  async anularPago(
    @Param('id', ParseIntPipe) id: number,
    @Body('justificacion') justificacion: string
  ) {
    return this.trabajadoresService.anularPago(id, justificacion);
  }

  @Patch('pagos/:id/firma')
  async confirmarFirma(
    @Param('id', ParseIntPipe) id: number,
    @Body('firma_url') firma_url: string
  ) {
    return this.trabajadoresService.confirmarPagoConFirma(id, firma_url);
  }

  // ============================================================
  // 📌 ENDPOINTS DASHBOARD — SUPERVISIÓN (Hero2)
  // ============================================================

  @Get('activos/count')
  async contarActivos() {
    return this.trabajadoresService.contarTrabajadoresActivos();
  }

  @Get('activos/lista')
  async listarActivos() {
    return this.trabajadoresService.listarTrabajadoresActivos();
  }

  @Get('pagos/resumen')
  async resumenPagos() {
    return this.trabajadoresService.resumenPagos();
  }

  @Get('insumos/criticos/count')
  async contarInsumosCriticos() {
    return this.trabajadoresService.contarInsumosCriticos();
  }

  @Get('insumos/criticos/lista')
  async listarInsumosCriticos() {
    return this.trabajadoresService.listarInsumosCriticos();
  }
}