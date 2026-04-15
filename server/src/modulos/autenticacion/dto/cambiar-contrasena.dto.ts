// src/modulos/autenticacion/dto/cambiar-contrasena.dto.ts
import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class CambiarContrasenaDto {
  @IsString({ message: 'La contraseña actual debe ser texto' })
  @IsNotEmpty({ message: 'La contraseña actual es requerida' })
  contrasena_actual: string;

  @IsString({ message: 'La nueva contraseña debe ser texto' })
  @MinLength(6, { message: 'La nueva contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  nueva_contrasena: string;
}