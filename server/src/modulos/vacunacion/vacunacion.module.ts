import { Module } from '@nestjs/common';
import { VacunacionController } from './vacunacion.controller';
import { VacunacionService } from './vacunacion.service';

@Module({
    controllers: [VacunacionController],
    providers: [VacunacionService],
})
export class VacunacionModule {}