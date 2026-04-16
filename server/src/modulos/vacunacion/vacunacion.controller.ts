import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { VacunacionService } from './vacunacion.service';
import { CrearVacunaDto } from './dto/crear-vacuna.dto';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

@Controller('vacunacion')
@UseGuards(AutenticacionGuardia)
export class VacunacionController {
    constructor(private readonly vacunacionService: VacunacionService) {}

    @Get()
    async listarVacunas() {
        return this.vacunacionService.listarVacunas();
    }

    @Post()
    async crearVacuna(@Body() datos: CrearVacunaDto) {
        return this.vacunacionService.crearVacuna(datos);
    }
}