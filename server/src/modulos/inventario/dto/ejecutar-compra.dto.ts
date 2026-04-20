import { IsNumber, IsString, IsOptional, IsDateString, IsPositive } from 'class-validator';

export class EjecutarCompraDto {
    @IsNumber()
    id_solicitud: number;

    @IsDateString()
    fecha_compra_real: string;

    @IsString()
    numero_lote: string;

    @IsNumber()
    @IsPositive()
    cantidad_real: number;

    @IsNumber()
    @IsPositive()
    precio_unitario: number;

    @IsNumber()
    @IsPositive()
    precio_total: number;

    @IsString()
    @IsOptional()
    factura?: string;

    @IsDateString()
    @IsOptional()
    fecha_vencimiento?: string;

    @IsString()
    proveedor_real: string;

    @IsString()
    @IsOptional()
    observaciones?: string;

    @IsString()
    tipo: string;

    @IsString()
    nombre_producto: string;

    @IsString()
    unidad_medida: string;
}