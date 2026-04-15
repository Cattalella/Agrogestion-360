// src/modulos/ganaderia/ganaderia.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
} from '@nestjs/common';
import { GanaderiaService } from './ganaderia.service';
import { CrearAnimalDto } from './dto/crear-animal.dto';
import { ActualizarAnimalDto } from './dto/actualizar-animal.dto';
import { AutenticacionGuardia } from '../../compartido/guardias/autenticacion.guardia';
import { Roles } from '../../compartido/decoradores/roles.decorador';
import { RolesGuardia } from '../../compartido/guardias/roles.guardia';

@Controller('ganaderia')
@UseGuards(AutenticacionGuardia, RolesGuardia)
export class GanaderiaController {
    constructor(private readonly ganaderiaService: GanaderiaService) {}

    // ============================================================
    // GET /api/ganaderia/catalogos
    // ============================================================
    @Get('catalogos')
    async obtenerCatalogos() {
        return this.ganaderiaService.obtenerCatalogos();
    }

    // ============================================================
    // GET /api/ganaderia
    // ============================================================
    @Get()
    async obtenerTodos() {
        return this.ganaderiaService.obtenerTodos();
    }

    // ============================================================
    // GET /api/ganaderia/:id
    // ============================================================
    @Get(':id')
    async obtenerPorId(@Param('id', ParseIntPipe) id: number) {
        return this.ganaderiaService.obtenerPorId(id);
    }

    // ============================================================
    // POST /api/ganaderia
    // ============================================================
    @Post()
    @Roles('Administrador', 'Dueño')
    async crear(@Body() crearDto: CrearAnimalDto) {
        return this.ganaderiaService.crear(crearDto);
    }

    // ============================================================
    // PUT /api/ganaderia/:id
    // ============================================================
    @Put(':id')
    @Roles('Administrador', 'Dueño')
    async actualizar(
        @Param('id', ParseIntPipe) id: number,
        @Body() actualizarDto: ActualizarAnimalDto,
    ) {
        return this.ganaderiaService.actualizar(id, actualizarDto);
    }

    // ============================================================
    // DELETE /api/ganaderia/:id
    // ============================================================
    @Delete(':id')
    @Roles('Administrador', 'Dueño')
    @HttpCode(HttpStatus.OK)
    async eliminar(@Param('id', ParseIntPipe) id: number) {
        return this.ganaderiaService.eliminar(id);
    }
}