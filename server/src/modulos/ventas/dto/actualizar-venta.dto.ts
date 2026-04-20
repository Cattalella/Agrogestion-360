import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class ActualizarVentaDto {
    @IsOptional()
    @IsNumber()
    id_animal?: number;

    @IsOptional()
    @IsDateString()
    fecha_venta?: string;

    @IsOptional()
    @IsNumber()
    @Min(0)
    peso_venta?: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    precio_total?: number;

    @IsOptional()
    @IsString()
    comprador?: string;

    @IsOptional()
    @IsString()
    num_factura?: string;

    @IsOptional()
    @IsString()
    metodo_pago?: string;

    @IsOptional()
    @IsString()
    observaciones?: string;
}