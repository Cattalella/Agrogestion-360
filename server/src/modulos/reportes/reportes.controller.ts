import { 
  Controller, 
  Get, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ReportesService } from './reportes.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';

@Controller('reportes')
@UseGuards(AutenticacionGuardia, RolesGuardia)
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  @Get('financiero')
  @Roles('Dueño')
  async obtenerResumenFinanciero(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string
  ) {
    const fechaInicio = inicio ? new Date(inicio) : new Date(new Date().getFullYear(), 0, 1);
    const fechaFin = fin ? new Date(fin) : new Date();
    return this.reportesService.obtenerResumenFinanciero(fechaInicio, fechaFin);
  }

  @Get('inventario-critico')
  @Roles('Dueño')
  async obtenerInventarioCritico() {
    return this.reportesService.obtenerInventarioCritico();
  }

  @Get('actividad-trabajadores')
  @Roles('Dueño')
  async obtenerActividadTrabajadores(
    @Query('inicio') inicio: string,
    @Query('fin') fin: string
  ) {
    const fechaInicio = inicio ? new Date(inicio) : new Date(new Date().setDate(new Date().getDate() - 30));
    const fechaFin = fin ? new Date(fin) : new Date();
    return this.reportesService.obtenerActividadTrabajadores(fechaInicio, fechaFin);
  }

  @Get('dashboard')
  @Roles('Dueño')
  async obtenerDashboard(
    @Query('filtro') filtro: string
  ) {
    let fechaInicio = new Date(new Date().getFullYear(), 0, 1);
    const fechaFin = new Date();

    if (filtro === 'ESTE MES') {
      fechaInicio = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    } else if (filtro === 'SEIS MESES') {
      fechaInicio = new Date(new Date().setMonth(new Date().getMonth() - 6));
    }

    return this.reportesService.obtenerDashboard(fechaInicio, fechaFin);
  }
}
