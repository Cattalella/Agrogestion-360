// src/modulos/ganaderia/dto/crear-animal.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CrearAnimalDto {
    @IsString()
    @IsOptional()
    num_ica_chapeta?: string;

    @IsString()
    @IsNotEmpty({ message: 'El código local es requerido' })
    codigo_local: string;

    @IsNumber()
    @IsOptional()
    id_especie?: number;

    @IsString()
    @IsNotEmpty({ message: 'El sexo es requerido' })
    sexo: string;

    @IsString()
    @IsOptional()
    raza?: string;

    @IsDateString()
    @IsOptional()
    fecha_nacimiento?: string;

    @IsNumber()
    @IsOptional()
    peso_actual?: number;

    @IsString()
    @IsOptional()
    origen?: string;

    @IsNumber()
    @IsOptional()
    id_ubicacion?: number;

    @IsNumber()
    @IsOptional()
    id_estado_ani?: number;

    // ✅ CORREGIDO: estado_salud → salud
    @IsString()
    @IsOptional()
    salud?: string;

    @IsString()
    @IsOptional()
    foto_url?: string;
}