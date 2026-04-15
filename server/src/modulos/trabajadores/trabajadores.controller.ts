import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  ParseIntPipe,
  HttpCode
} from '@nestjs/common';
import { TrabajadoresService } from './trabajadores.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

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

  @Post(':id/eliminar') // O DELETE ':id'
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
  async registrarTrabajo(@Body() datos: any) {
    return this.trabajadoresService.registrarTrabajo(datos);
  }

  // ============================================================
  // 📌 ENDPOINTS PAGOS
  // ============================================================

  @Get('pagos')
  async listarPagos() {
    return this.trabajadoresService.listarPagos();
  }

  @Post('pagos')
  async registrarPago(@Body() datos: any) {
    return this.trabajadoresService.registrarPago(datos);
  }

  @Patch('pagos/:id/anular')
  async anularPago(
    @Param('id', ParseIntPipe) id: number,
    @Body('justificacion') justificacion: string
  ) {
    return this.trabajadoresService.anularPago(id, justificacion);
  }
}
