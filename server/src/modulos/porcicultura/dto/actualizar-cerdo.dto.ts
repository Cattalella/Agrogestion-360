import { IsString, IsOptional, IsNumber, IsDateString, Min, Max } from 'class-validator';

export class ActualizarCerdoDto {
    @IsString({ message: 'El número ICA/Chapeta debe ser texto' })
    @IsOptional()
    num_ica_chapeta?: string;

    @IsString({ message: 'El código local debe ser texto' })
    @IsOptional()
    codigo_local?: string;

    @IsString({ message: 'El sexo debe ser texto' })
    @IsOptional()
    sexo?: string;

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
    origen?: string;

    @IsString({ message: 'El establo debe ser texto' })
    @IsOptional()
    establo?: string;

    @IsString({ message: 'El estado de salud debe ser texto' })
    @IsOptional()
    estado_salud?: string;

    @IsString({ message: 'La URL de la foto debe ser texto' })
    @IsOptional()
    foto_url?: string;
}