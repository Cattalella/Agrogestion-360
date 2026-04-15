// src/modulos/recordatorios/dto/actualizar-recordatorio.dto.ts
import { IsBoolean, IsOptional } from 'class-validator';

export class ActualizarRecordatorioDto {
  @IsBoolean({ message: 'El campo cumplido debe ser verdadero o falso' })
  @IsOptional()
  cumplido?: boolean;
}