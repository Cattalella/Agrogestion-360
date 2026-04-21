// server/src/modulos/trabajadores/dto/Crear-trabajo.dto.ts
import { IsString, IsOptional, IsNumber, IsDateString, IsInt, Min } from 'class-validator';

export class CrearTrabajoDto {
    @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
    id_trabajador: number;

    @IsString({ message: 'La categoría del trabajo es obligatoria' })
    categoria_trabajo: string;

    @IsString({ message: 'El tipo de actividad es obligatorio' })
    tipo_actividad: string;

    @IsDateString({}, { message: 'La fecha de inicio debe tener formato YYYY-MM-DD' })
    fecha_inicio: string;

    @IsDateString({}, { message: 'La fecha de fin debe tener formato YYYY-MM-DD' })
    fecha_fin: string;

    @IsNumber({}, { message: 'La duración en horas debe ser un número' })
    @Min(0, { message: 'La duración debe ser mayor o igual a 0' })
    @IsOptional()
    duracion_horas?: number;

    @IsString({ message: 'La URL de la evidencia es obligatoria' })
    evidencia_url: string;

    @IsString({ message: 'Las observaciones deben ser texto' })
    @IsOptional()
    observaciones?: string;
}