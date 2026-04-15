import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuditoriaService } from './auditoria.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

@Controller('auditoria')
@UseGuards(AutenticacionGuardia)
export class AuditoriaController {
  constructor(private readonly auditoriaService: AuditoriaService) {}

  @Get('recientes')
  async listarRecientes() {
    return this.auditoriaService.listarRecientes();
  }
}
