import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class ActualizarTrabajoDto {
    @IsString({ message: 'La categoría del trabajo debe ser texto' })
    @IsOptional()
    categoria_trabajo?: string;

    @IsString({ message: 'El tipo de actividad debe ser texto' })
    @IsOptional()
    tipo_actividad?: string;

    @IsDateString({}, { message: 'La fecha de inicio debe tener formato válido' })
    @IsOptional()
    fecha_inicio?: string;

    @IsDateString({}, { message: 'La fecha de fin debe tener formato válido' })
    @IsOptional()
    fecha_fin?: string;

    @IsNumber({}, { message: 'La duración debe ser un número' })
    @Min(0, { message: 'La duración no puede ser negativa' })
    @IsOptional()
    duracion_horas?: number;

    @IsString({ message: 'La URL de evidencia debe ser texto' })
    @IsOptional()
    evidencia_url?: string;

    @IsString({ message: 'Las observaciones deben ser texto' })
    @IsOptional()
    observaciones?: string;
}