// src/modulos/encabezado/encabezado.module.ts
import { Module } from '@nestjs/common';
import { EncabezadoController } from './encabezado.controller';
import { EncabezadoService } from './encabezado.service';

@Module({
  controllers: [EncabezadoController],
  providers: [EncabezadoService],
  exports: [EncabezadoService],
})
export class EncabezadoModule {}