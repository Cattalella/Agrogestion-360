import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { CrearVentaDto } from './dto/crear-venta.dto';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';

@Controller('ventas')
@UseGuards(AutenticacionGuardia)
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
    async crearVenta(@Body() datos: CrearVentaDto) {
        return this.ventasService.crearVenta(datos);
    }
}