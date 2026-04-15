import { Module } from '@nestjs/common';
import { PorciculturaController } from './porcicultura.controller';
import { PorciculturaService } from './porcicultura.service';

@Module({
  controllers: [PorciculturaController],
  providers: [PorciculturaService],
  exports: [PorciculturaService],
})
export class PorciculturaModule {}
