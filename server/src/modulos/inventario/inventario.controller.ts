import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Put,
  Delete,
  Param, 
  Body, 
  UseGuards, 
  ParseIntPipe
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';
import { UsuarioActual } from '../../compartido/decoradores/usuario-actual.decorador';

@Controller('inventario')
@UseGuards(AutenticacionGuardia, RolesGuardia)
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  @Get()
  @Roles('Administrador', 'Dueño')
  async obtenerInventario() {
    return this.inventarioService.obtenerInventarioActual();
  }

  @Get('solicitudes')
  @Roles('Administrador', 'Dueño')
  async obtenerSolicitudes() {
    return this.inventarioService.obtenerSolicitudes();
  }

  @Post('solicitudes')
  @Roles('Administrador', 'Dueño')
  async crearSolicitud(
    @Body() datos: any,
    @UsuarioActual('id_persona') idAdmin: number
  ) {
    return this.inventarioService.crearSolicitud(idAdmin, datos);
  }

  @Put('solicitudes/:id')
  @Roles('Administrador', 'Dueño')
  async actualizarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() datos: any,
    @UsuarioActual('id_persona') idAdmin: number
  ) {
    return this.inventarioService.actualizarSolicitud(id, idAdmin, datos);
  }

  @Patch('solicitudes/:id/procesar')
  @Roles('Dueño')
  async procesarSolicitud(
    @UsuarioActual('id_persona') idDueno: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: 'Aprobada' | 'Rechazada', observaciones?: string }
  ) {
    return this.inventarioService.procesarSolicitud(idDueno, id, body.estado, body.observaciones);
  }

  @Post('solicitudes/:id/ejecutar')
  @Roles('Administrador', 'Dueño')
  async ejecutarCompra(
    @UsuarioActual('id_persona') idAdmin: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() datosLote: any
  ) {
    return this.inventarioService.ejecutarCompra(idAdmin, id, datosLote);
  }

  // ============================================================
  // 🆕 NUEVO ENDPOINT: EJECUTAR COMPRA REAL (con todos los datos)
  // ============================================================
  @Post('compras/ejecutar')
  @Roles('Administrador', 'Dueño')
  async ejecutarCompraReal(@Body() datosCompra: any) {
    return this.inventarioService.ejecutarCompraReal(datosCompra);
  }

  @Delete('solicitudes/:id')
  @Roles('Administrador', 'Dueño')
  async eliminarSolicitud(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { motivo_eliminacion: string }
  ) {
    return this.inventarioService.eliminarSolicitud(id, body.motivo_eliminacion);
  }

  @Post('consumo')
  @Roles('Administrador', 'Dueño')
  async registrarConsumo(
    @UsuarioActual('id_persona') idResponsable: number,
    @Body() datos: any
  ) {
    return this.inventarioService.registrarConsumo(idResponsable, datos);
  }
}