import { IsString, IsOptional, IsNumber, IsDateString, IsInt, Min } from 'class-validator';

export class CrearPagoDto {
    @IsInt({ message: 'El ID del trabajador debe ser un número entero' })
    id_trabajador: number;

    @IsInt({ message: 'El ID del trabajo debe ser un número entero' })
    @IsOptional()
    id_trabajo?: number;

    @IsDateString({}, { message: 'La fecha de pago debe tener formato YYYY-MM-DD' })
    fecha_pago: string;

    @IsNumber({}, { message: 'El monto total debe ser un número' })
    @Min(0.01, { message: 'El monto debe ser mayor a 0' })
    monto_total: number;

    @IsString({ message: 'El concepto debe ser texto' })
    concepto: string;

    @IsString({ message: 'El estado del pago debe ser texto' })
    @IsOptional()
    estado_pago?: string;

    @IsString({ message: 'La URL de la firma debe ser texto' })
    @IsOptional()
    firma_url?: string;
}