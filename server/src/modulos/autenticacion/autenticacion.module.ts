// src/modulos/autenticacion/autenticacion.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { AuditoriaModule } from '../auditoria/auditoria.module';

@Module({
  imports: [
    AuditoriaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRETO || 'agro360_secreto_super_seguro_2024',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
  exports: [AutenticacionService],
})
export class AutenticacionModule {}