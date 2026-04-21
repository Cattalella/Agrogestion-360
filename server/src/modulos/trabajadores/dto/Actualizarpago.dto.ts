// server/src/modulos/trabajadores/dto/Actualizar-pago.dto.ts
import { IsString, IsOptional, IsNumber, IsDateString, Min } from 'class-validator';

export class ActualizarPagoDto {
    @IsDateString({}, { message: 'La fecha de pago debe tener formato YYYY-MM-DD' })
    @IsOptional()
    fecha_pago?: string;

    @IsNumber({}, { message: 'El monto total debe ser un número' })
    @Min(0.01, { message: 'El monto debe ser mayor a 0' })
    @IsOptional()
    monto_total?: number;

    @IsString({ message: 'El concepto debe ser texto' })
    @IsOptional()
    concepto?: string;

    @IsString({ message: 'El estado del pago debe ser texto' })
    @IsOptional()
    estado_pago?: string;

    @IsString({ message: 'La URL de la firma debe ser texto' })
    @IsOptional()
    firma_url?: string;
}