import { IsOptional, IsString, IsNumber, IsDateString } from 'class-validator';

export class CrearCerdoDto {
    @IsString()
    local: string;

    @IsOptional()
    @IsString()
    oficial?: string;

    @IsOptional()
    @IsString()
    sexo?: string;

    @IsOptional()
    @IsString()
    raza?: string;

    @IsOptional()
    @IsDateString()
    nacimiento?: string;

    @IsDateString()
    ingreso: string;

    @IsOptional()
    @IsNumber()
    peso?: number;

    @IsOptional()
    @IsString()
    origen?: string;

    @IsOptional()
    @IsString()
    foto?: string;

    @IsOptional()
    @IsString()
    id_madre?: string;

    @IsOptional()
    @IsString()
    establo?: string;

    @IsOptional()
    @IsString()
    salud?: string;
}