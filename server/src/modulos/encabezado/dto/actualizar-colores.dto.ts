// src/modulos/encabezado/dto/actualizar-colores.dto.ts
import { IsString, IsOptional, Matches } from 'class-validator';

export class ActualizarColoresDto {
    @IsString()
    @IsOptional()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser hexadecimal (ej: #FF0000)' })
    color_titulo?: string;

    @IsString()
    @IsOptional()
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser hexadecimal (ej: #FF0000)' })
    color_subtitulo?: string;
}