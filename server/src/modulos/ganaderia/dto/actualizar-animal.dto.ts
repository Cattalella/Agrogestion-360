// src/modulos/ganaderia/dto/actualizar-animal.dto.ts
import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class ActualizarAnimalDto {
    @IsString({ message: 'El número ICA/Chapeta debe ser texto' })
    @IsOptional()
    num_ica_chapeta?: string;

    @IsString({ message: 'El código local debe ser texto' })
    @IsOptional()
    codigo_local?: string;

    @IsString({ message: 'El sexo debe ser texto' })
    @IsOptional()
    sexo?: string;  // 'MACHO' o 'HEMBRA'

    @IsString({ message: 'La raza debe ser texto' })
    @IsOptional()
    raza?: string;

    @IsDateString({}, { message: 'La fecha de nacimiento debe tener formato YYYY-MM-DD' })
    @IsOptional()
    fecha_nacimiento?: string;

    @IsNumber({}, { message: 'El peso debe ser un número' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    @IsOptional()
    peso_actual?: number;

    @IsString({ message: 'El origen debe ser texto' })
    @IsOptional()
    origen?: string;  // 'Nacimiento', 'Compra', 'Registro inicial'

    @IsNumber({}, { message: 'El ID de ubicación debe ser un número' })
    @IsOptional()
    id_ubicacion?: number;

    @IsNumber({}, { message: 'El ID de estado debe ser un número' })
    @IsOptional()
    id_estado_ani?: number;

    @IsString({ message: 'La URL de la foto debe ser texto' })
    @IsOptional()
    foto_url?: string;

    // ✅ AGREGAR: Estado de salud (Sano, Enfermo, En cuidado)
    @IsString({ message: 'El estado de salud debe ser texto' })
    @IsOptional()
    salud?: string;
}