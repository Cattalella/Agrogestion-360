import { Controller, Get, Post, Body, UseGuards, Put, Delete, Param, ParseIntPipe } from '@nestjs/common';
import { PorciculturaService } from './porcicultura.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';

@Controller('porcicultura')
@UseGuards(AutenticacionGuardia, RolesGuardia)
export class PorciculturaController {
    constructor(private readonly porciculturaService: PorciculturaService) {}

    @Get('cerdos')
    async listarCerdos() {
        return this.porciculturaService.listarCerdos();
    }

    @Post('cerdos')
    @Roles('Administrador', 'Dueño')
    async registrarCerdo(@Body() datos: any) {
        return this.porciculturaService.registrarCerdo(datos);
    }

    @Put('cerdos/:id')
    @Roles('Administrador', 'Dueño')
    async actualizarCerdo(
        @Param('id', ParseIntPipe) id: number,
        @Body() datos: any
    ) {
        return this.porciculturaService.actualizarCerdo(id, datos);
    }

    @Delete('cerdos/:id')
    @Roles('Administrador', 'Dueño')
    async eliminarCerdo(@Param('id', ParseIntPipe) id: number) {
        return this.porciculturaService.eliminarCerdo(id);
    }
}