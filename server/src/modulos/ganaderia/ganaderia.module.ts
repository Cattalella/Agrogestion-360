// src/modulos/ganaderia/ganaderia.module.ts
import { Module } from '@nestjs/common';
import { GanaderiaController } from './ganaderia.controller';
import { GanaderiaService } from './ganaderia.service';

@Module({
    controllers: [GanaderiaController],
    providers: [GanaderiaService],
    exports: [GanaderiaService],
})
export class GanaderiaModule {}