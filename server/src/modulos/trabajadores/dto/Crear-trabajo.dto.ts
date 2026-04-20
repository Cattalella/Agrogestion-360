import { IsString, IsOptional, IsNumber, IsDateString, IsInt, Min } from 'class-validator';

export class CrearTrabajoDto {
    @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
    id_trabajador: number;

    @IsString({ message: 'La categoría del trabajo debe ser texto' })
    categoria_trabajo: string;

    @IsString({ message: 'El tipo de actividad debe ser texto' })
    tipo_actividad: string;

    @IsDateString({}, { message: 'La fecha de inicio debe tener formato válido' })
    fecha_inicio: string;

    @IsDateString({}, { message: 'La fecha de fin debe tener formato válido' })
    fecha_fin: string;

    @IsNumber({}, { message: 'La duración debe ser un número' })
    @Min(0, { message: 'La duración no puede ser negativa' })
    duracion_horas: number;

    @IsString({ message: 'La URL de evidencia debe ser texto' })
    evidencia_url: string;

    @IsString({ message: 'Las observaciones deben ser texto' })
    @IsOptional()
    observaciones?: string;
}