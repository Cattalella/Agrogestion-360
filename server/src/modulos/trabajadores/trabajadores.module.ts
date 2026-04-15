import { Module } from '@nestjs/common';
import { TrabajadoresController } from './trabajadores.controller';
import { TrabajadoresService } from './trabajadores.service';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [AuditoriaModule],
  controllers: [TrabajadoresController],
  providers: [TrabajadoresService],
  exports: [TrabajadoresService],
})
export class TrabajadoresModule {}
