// server/src/modulos/administradores/administradores.controller.ts
import { Controller, Get, Post, Patch, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { AdministradoresService } from './administradores.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

@Controller('administradores')
@UseGuards(AutenticacionGuardia)
export class AdministradoresController {
    constructor(private readonly administradoresService: AdministradoresService) {}

    @Get('activos')
    listarActivos() {
        return this.administradoresService.listarActivos();
    }

    @Get('revocados')
    listarRevocados() {
        return this.administradoresService.listarRevocados();
    }

    @Post('registrar')
    registrar(@Body() datos: any) {
        return this.administradoresService.registrar(datos);
    }

    @Patch(':id/inhabilitar')
    inhabilitar(@Param('id', ParseIntPipe) id: number) {
        return this.administradoresService.inhabilitar(id);
    }

    @Patch(':id/habilitar')
    habilitar(@Param('id', ParseIntPipe) id: number) {
        return this.administradoresService.habilitar(id);
    }
}