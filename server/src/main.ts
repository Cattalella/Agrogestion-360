// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as bodyParser from 'body-parser';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ============================================================
  // 🆕 AUMENTAR LÍMITE DE TAMAÑO PARA PETICIONES (IMÁGENES)
  // ============================================================
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  // ============================================================
  // PREFIJO GLOBAL PARA LA API
  // ============================================================
  app.setGlobalPrefix('api');

  // ============================================================
  // CONFIGURAR CORS
  // ============================================================
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // ============================================================
  // 🆕 VALIDACIÓN GLOBAL DE DTOS
  // ============================================================
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // ============================================================
  // INICIAR SERVIDOR
  // ============================================================
  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor de AgroGestión corriendo en: ${await app.getUrl()}`);
}

bootstrap();