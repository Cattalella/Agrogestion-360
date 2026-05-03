import { Controller, Get, Query } from '@nestjs/common';
import { AnaliticasService, FiltroFecha } from './analiticas.service';

@Controller('analiticas')
export class AnaliticasController {
  constructor(private readonly analiticasService: AnaliticasService) {}

  @Get('dashboard')
  getDashboard(
    @Query('filtro') filtro?: FiltroFecha,
    @Query('fecha_inicio') fechaInicio?: string,
    @Query('fecha_fin') fechaFin?: string,
    @Query('es_rango') esRango?: string
  ) {
    // Si es rango personalizado
    if (esRango === 'true' && fechaInicio && fechaFin) {
      return this.analiticasService.getDashboard(undefined, fechaInicio, fechaFin);
    }
    
    // Filtro normal
    return this.analiticasService.getDashboard(filtro || FiltroFecha.ESTE_MES);
  }
}