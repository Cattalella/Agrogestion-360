import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards 
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

@Controller('ventas')
@UseGuards(AutenticacionGuardia)
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Get()
  async listarVentas() {
    return this.ventasService.listarVentas();
  }

  @Post()
  async registrarVenta(@Body() datos: any) {
    return this.ventasService.registrarVenta(datos);
  }
}
