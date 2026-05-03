import { AdministradoresModule } from './modulos/administradores/administradores.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { EvidenciasModule } from './modulos/evidencias/evidencias.module';

import { PrismaModule } from './prisma/prisma.module';
import { AutenticacionModule } from './modulos/autenticacion/autenticacion.module';
import { EncabezadoModule } from './modulos/encabezado/encabezado.module';
import { RecordatoriosModule } from './modulos/recordatorio/recordatorio.module';
import { GanaderiaModule } from './modulos/ganaderia/ganaderia.module';
import { PorciculturaModule } from './modulos/porcicultura/porcicultura.module';
import { InventarioModule } from './modulos/inventario/inventario.module';
import { TrabajadoresModule } from './modulos/trabajadores/trabajadores.module';
import { VentasModule } from './modulos/ventas/ventas.module';
import { ReportesModule } from './modulos/reportes/reportes.module';
import { AuditoriaModule } from './modulos/auditoria/auditoria.module';
import { AnaliticasModule } from './modulos/analiticas/analiticas.module';
import { VacunacionModule } from './modulos/vacunacion/vacunacion.module';
import { ExcepcionGlobalFiltro } from './compartido/filtros/excepcion-global.filtro';
import { ValidacionTuberia } from './compartido/tuberias/validacion.tuberia';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'archivos-subidos'),
      serveRoot: '/archivos-subidos',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRETO || 'agro360_secreto_super_seguro_2024',
      signOptions: { expiresIn: '7d' },
      global: true,
    }),
    PrismaModule,
    AutenticacionModule,
    EncabezadoModule,
    RecordatoriosModule,
    GanaderiaModule,
    PorciculturaModule,
    InventarioModule,
    TrabajadoresModule,
    VentasModule,
    AuditoriaModule,
    ReportesModule,
    VacunacionModule,
    AnaliticasModule,
    AdministradoresModule,
    EvidenciasModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_FILTER, useClass: ExcepcionGlobalFiltro },
    { provide: APP_PIPE, useClass: ValidacionTuberia },
  ],
})
export class AppModule {}