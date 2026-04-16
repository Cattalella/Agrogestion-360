import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PorciculturaService } from './porcicultura.service';
import { CrearCerdoDto } from './dto/crear-cerdo.dto';
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
    async registrarCerdo(@Body() datos: CrearCerdoDto) {
        return this.porciculturaService.registrarCerdo(datos);
    }
}