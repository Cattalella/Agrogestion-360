// src/modulos/ganaderia/dto/crear-animal.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsDateString } from 'class-validator';

export class CrearAnimalDto {
    @IsString()
    @IsOptional()
    num_ica_chapeta?: string;  // oficial

    @IsString()
    @IsNotEmpty({ message: 'El código local es requerido' })
    codigo_local: string;       // local

    @IsNumber()
    @IsOptional()
    id_especie?: number;        // El servicio lo crea automáticamente si no viene

    @IsString()
    @IsNotEmpty({ message: 'El sexo es requerido' })
    sexo: string;               // MACHO, HEMBRA

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
    origen?: string;            // Nacimiento, Compra, etc.

    @IsNumber()
    @IsOptional()
    id_ubicacion?: number;      // El servicio lo crea automáticamente si no viene

    @IsNumber()
    @IsOptional()
    id_estado_ani?: number;     // Usado en actualizaciones

    @IsString()
    @IsOptional()
    estado_salud?: string;      // Sano, Enfermo, etc.

    @IsString()
    @IsOptional()
    foto_url?: string;
}