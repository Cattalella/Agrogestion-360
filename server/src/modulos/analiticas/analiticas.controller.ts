import { Controller, Get, Query } from '@nestjs/common';
import { AnaliticasService, FiltroFecha } from './analiticas.service';

@Controller('analiticas')
export class AnaliticasController {
  constructor(private readonly analiticasService: AnaliticasService) {}

  @Get('dashboard')
  getDashboard(@Query('filtro') filtro: FiltroFecha = FiltroFecha.ESTE_MES) {
    // GET /analiticas/dashboard?filtro=este_mes
    return this.analiticasService.getDashboard(filtro);
  }
}