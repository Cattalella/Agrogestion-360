// src/modulos/recordatorios/recordatorios.module.ts
import { Module } from '@nestjs/common';
import { RecordatoriosController } from './recordatorio.controller';
import { RecordatoriosService } from './recordatorio.service';

@Module({
  controllers: [RecordatoriosController],
  providers: [RecordatoriosService],
  exports: [RecordatoriosService],
})
export class RecordatoriosModule {}