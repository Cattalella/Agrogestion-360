import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Param, 
  Body, 
  UseGuards, 
  ParseIntPipe 
} from '@nestjs/common';
import { InventarioService } from './inventario.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { UsuarioActual } from '../../compartido/decoradores/usuario-actual.decorador';

@Controller('inventario')
@UseGuards(AutenticacionGuardia)
export class InventarioController {
  constructor(private readonly inventarioService: InventarioService) {}

  // GET /api/inventario
  @Get()
  async obtenerInventario() {
    return this.inventarioService.obtenerInventarioActual();
  }

  // GET /api/inventario/solicitudes
  @Get('solicitudes')
  async obtenerSolicitudes() {
    return this.inventarioService.obtenerSolicitudes();
  }

  // POST /api/inventario/solicitudes
  @Post('solicitudes')
  async crearSolicitud(
    @UsuarioActual('id_persona') idAdmin: number,
    @Body() datos: any
  ) {
    return this.inventarioService.crearSolicitud(idAdmin, datos);
  }

  // PATCH /api/inventario/solicitudes/:id/procesar
  @Patch('solicitudes/:id/procesar')
  async procesarSolicitud(
    @UsuarioActual('id_persona') idDueno: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: 'Aprobada' | 'Rechazada', observaciones?: string }
  ) {
    return this.inventarioService.procesarSolicitud(idDueno, id, body.estado, body.observaciones);
  }

  // POST /api/inventario/solicitudes/:id/ejecutar
  @Post('solicitudes/:id/ejecutar')
  async ejecutarCompra(
    @UsuarioActual('id_persona') idAdmin: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() datosLote: any
  ) {
    return this.inventarioService.ejecutarCompra(idAdmin, id, datosLote);
  }

  // POST /api/inventario/consumo
  @Post('consumo')
  async registrarConsumo(
    @UsuarioActual('id_persona') idResponsable: number,
    @Body() datos: any
  ) {
    return this.inventarioService.registrarConsumo(idResponsable, datos);
  }
}
