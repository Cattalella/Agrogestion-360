import { IsString, IsOptional, IsDateString, IsNumber } from 'class-validator';

export class ActualizarVacunaDto {
    @IsNumber()
    @IsOptional()
    id_animal?: number;

    @IsString()
    @IsOptional()
    tipo_vacuna?: string;

    @IsDateString()
    @IsOptional()
    fecha_aplicacion?: string;

    @IsString()
    @IsOptional()
    dosis?: string;

    @IsString()
    @IsOptional()
    via_aplicacion?: string;

    @IsString()
    @IsOptional()
    lote_vacuna?: string;

    @IsDateString()
    @IsOptional()
    proximo_refuerzo?: string;

    @IsString()
    @IsOptional()
    responsable?: string;

    @IsString()
    @IsOptional()
    observaciones?: string;
}