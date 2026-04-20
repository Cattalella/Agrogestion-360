import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { VacunacionService } from './vacunacion.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';

@Controller('vacunacion')
@UseGuards(AutenticacionGuardia, RolesGuardia)
export class VacunacionController {
    constructor(private readonly vacunacionService: VacunacionService) {}

    @Get()
    async listarVacunas() {
        return this.vacunacionService.listarVacunas();
    }

    @Post()
    @Roles('Administrador', 'Dueño')
    async crearVacuna(@Body() datos: any, @Req() req: any) {
        const idAdmin = req.user?.id_persona || 5;
        return this.vacunacionService.crearVacuna(datos, idAdmin);
    }

    @Put(':id')
    @Roles('Administrador', 'Dueño')
    async actualizarVacuna(
        @Param('id', ParseIntPipe) id: number,
        @Body() datos: any
    ) {
        return this.vacunacionService.actualizarVacuna(id, datos);
    }

    @Delete(':id')
    @Roles('Administrador', 'Dueño')
    async eliminarVacuna(@Param('id', ParseIntPipe) id: number) {
        return this.vacunacionService.eliminarVacuna(id);
    }

    @Get('catalogo')
    async listarCatalogoVacunas() {
        return this.vacunacionService.listarCatalogoVacunas();
    }
}