// src/modulos/autenticacion/dto/recuperar-contrasena.dto.ts
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RecuperarContrasenaDto {
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsNotEmpty({ message: 'La nueva contraseña es requerida' })
  nueva_contrasena: string;
}