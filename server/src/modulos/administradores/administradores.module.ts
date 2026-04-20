// server/src/modulos/administradores/administradores.module.ts
import { Module } from '@nestjs/common';
import { AdministradoresController } from './administradores.controller';
import { AdministradoresService } from './administradores.service';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AdministradoresController],
    providers: [AdministradoresService],
})
export class AdministradoresModule {}