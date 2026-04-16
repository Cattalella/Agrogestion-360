import { Module } from '@nestjs/common';
import { AnaliticasService } from './analiticas.service';
import { AnaliticasController } from './analiticas.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AnaliticasController],
  providers: [AnaliticasService],
})
export class AnaliticasModule {}