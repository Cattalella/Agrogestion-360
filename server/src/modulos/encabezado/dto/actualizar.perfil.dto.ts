// src/modulos/encabezado/dto/actualizar-perfil.dto.ts
import { IsEmail, IsString, IsOptional } from 'class-validator';

export class ActualizarPerfilDto {
    @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
    @IsOptional()
    email?: string;

    @IsString({ message: 'El teléfono debe ser texto' })
    @IsOptional()
    telefono?: string;
}