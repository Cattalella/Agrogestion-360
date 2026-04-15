import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  ParseIntPipe 
} from '@nestjs/common';
import { PorciculturaService } from './porcicultura.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

@Controller('porcicultura')
@UseGuards(AutenticacionGuardia)
export class PorciculturaController {
  constructor(private readonly porciculturaService: PorciculturaService) {}

  @Get('cerdos')
  async listarCerdos() {
    return this.porciculturaService.listarCerdos();
  }

  @Post('cerdos')
  async registrarCerdo(@Body() datos: any) {
    return this.porciculturaService.registrarCerdo(datos);
  }

  @Post('vacunacion')
  async registrarVacunacion(@Body() datos: any) {
    return this.porciculturaService.registrarVacunacion(datos);
  }
}
