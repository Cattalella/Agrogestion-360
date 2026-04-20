// src/compartido/utilidades/archivos.utilidad.ts
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BadRequestException } from '@nestjs/common';

export const configuracionSubida = (carpeta: string): MulterOptions => ({
  storage: diskStorage({
    destination: (req, file, cb) => {
      const ruta = `./archivos-subidos/${carpeta}`;
      if (!existsSync(ruta)) {
        mkdirSync(ruta, { recursive: true });
      }
      cb(null, ruta);
    },
    filename: (req, file, cb) => {
      const nombreUnico = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = extname(file.originalname);
      cb(null, `${nombreUnico}${extension}`);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!tiposPermitidos.includes(file.mimetype)) {
      return cb(
        new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'),
        false
      );
    }
    cb(null, true);
  },
    import { memoryStorage } from 'multer';

    export const configuracionSubidaMemoria = (): MulterOptions => ({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!tiposPermitidos.includes(file.mimetype)) {
          return cb(
            new BadRequestException('Solo se permiten imágenes (JPEG, PNG, WEBP, GIF)'),
            false
          );
        }
        cb(null, true);
      },
});