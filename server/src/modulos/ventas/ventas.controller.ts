import { Controller, Get, Post, Body, Put, Delete, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';
import { UsuarioActual } from '../../compartido/decoradores/usuario-actual.decorador';

@Controller('ventas')
@UseGuards(AutenticacionGuardia, RolesGuardia)
export class VentasController {
    constructor(private readonly ventasService: VentasService) {}

    @Get()
    @Roles('Administrador', 'Dueño')
    async listarVentas() {
        return this.ventasService.listarVentas();
    }

    @Get(':id')
    @Roles('Administrador', 'Dueño')
    async obtenerVenta(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.obtenerVenta(id);
    }

    @Post()
    @Roles('Administrador', 'Dueño')
    async crearVenta(@Body() datos: any) {
        // 🔧 CORREGIDO: solo pasar datos, no idAdmin
        return this.ventasService.crearVenta(datos);
    }

    @Put(':id')
    @Roles('Administrador', 'Dueño')
    async actualizarVenta(
        @Param('id', ParseIntPipe) id: number,
        @Body() datos: any
    ) {
        return this.ventasService.actualizarVenta(id, datos);
    }

    @Delete(':id')
    @Roles('Administrador', 'Dueño')
    async eliminarVenta(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.eliminarVenta(id);
    }
}