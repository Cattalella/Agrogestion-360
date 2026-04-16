import { IsNumber, IsString, IsOptional, IsDateString, Min } from 'class-validator';

export class CrearVentaDto {
    @IsNumber({}, { message: 'El ID del animal es obligatorio' })
    id_animal: number;

    @IsDateString({}, { message: 'Fecha de venta inválida' })
    fecha_venta: string;

    @IsNumber({}, { message: 'El peso debe ser un número' })
    @Min(0, { message: 'El peso no puede ser negativo' })
    peso_venta: number;

    @IsNumber({}, { message: 'El precio total debe ser un número' })
    @Min(0, { message: 'El precio no puede ser negativo' })
    precio_total: number;

    @IsString({ message: 'El comprador es obligatorio' })
    comprador: string;

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