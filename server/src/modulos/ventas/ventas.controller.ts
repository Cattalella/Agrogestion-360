import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { ActualizarVentaDto } from './dto/actualizar-venta.dto';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';

@Controller('ventas')
@UseGuards(AutenticacionGuardia, RolesGuardia)
export class VentasController {
    constructor(private readonly ventasService: VentasService) {}

    @Get()
    async listarVentas() {
        return this.ventasService.listarVentas();
    }

    @Get(':id')
    async obtenerVenta(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.obtenerVenta(id);
    }

    @Post()
    @Roles('Administrador', 'Dueño')
    async crearVenta(@Body() datos: CrearVentaDto, @Req() req: any) {
        const idAdmin = req.user?.id_persona || 1;
        return this.ventasService.crearVenta(datos, idAdmin);
    }

    @Put(':id')
    @Roles('Administrador', 'Dueño')
    async actualizarVenta(
        @Param('id', ParseIntPipe) id: number,
        @Body() datos: ActualizarVentaDto
    ) {
        return this.ventasService.actualizarVenta(id, datos);
    }

    @Delete(':id')
    @Roles('Administrador', 'Dueño')
    async eliminarVenta(@Param('id', ParseIntPipe) id: number) {
        return this.ventasService.eliminarVenta(id);
    }
}