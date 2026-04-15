// src/modulos/encabezado/dto/actualizar-wallpaper.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class ActualizarWallpaperDto {
  @IsString({ message: 'El wallpaper debe ser texto (base64 o URL)' })
  @IsNotEmpty({ message: 'El wallpaper es requerido' })
  wallpaper_url: string;
}