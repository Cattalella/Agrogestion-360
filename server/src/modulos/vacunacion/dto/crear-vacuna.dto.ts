import { IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class CrearVacunaDto {
    @IsNumber()
    id_animal: number;

    @IsString()
    tipo_vacuna: string;

    @IsDateString()
    fecha_aplicacion: string;

    @IsOptional()
    @IsString()
    dosis?: string;

    @IsOptional()
    @IsString()
    via_aplicacion?: string;

    @IsOptional()
    @IsString()
    lote_vacuna?: string;

    @IsOptional()
    @IsDateString()
    proximo_refuerzo?: string;

    @IsOptional()
    @IsString()
    responsable?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}