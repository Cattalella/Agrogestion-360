// src/modulos/recordatorios/dto/crear-recordatorio.dto.ts
import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CrearRecordatorioDto {
  @IsDateString({}, { message: 'La fecha debe tener un formato válido (YYYY-MM-DD)' })
  @IsNotEmpty({ message: 'La fecha es requerida' })
  fecha!: string;

  @IsString({ message: 'El propósito debe ser texto' })
  @IsOptional()
  proposito?: string;
}