import { IsString, IsOptional, IsNumber, IsDateString, Min, IsIn } from 'class-validator';

export class CrearCerdoDto {
    @IsString({ message: 'El ID Local es obligatorio' })
    local: string;

    @IsOptional()
    @IsString()
    oficial?: string;

    @IsString({ message: 'El sexo es obligatorio' })
    @IsIn(['HEMBRA', 'MACHO', 'F', 'M'], { message: 'Sexo debe ser HEMBRA, MACHO, F o M' })
    sexo: string;

    @IsOptional()
    @IsString()
    raza?: string;

    @IsOptional()
    @IsDateString({}, { message: 'Fecha de nacimiento inválida' })
    nacimiento?: string;

    @IsDateString({}, { message: 'Fecha de ingreso inválida' })
    ingreso: string;

    @IsNumber({}, { message: 'El peso debe ser un número' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    peso: number;

    @IsOptional()
    @IsString()
    origen?: string;

    @IsOptional()
    @IsString()
    id_madre?: string;

    @IsOptional()
    @IsString()
    establo?: string;

    @IsOptional()
    @IsString()
    salud?: string;

    @IsOptional()
    @IsString()
    foto?: string;
}