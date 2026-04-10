import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuramos CORS una sola vez y correctamente
  app.enableCors({
    origin: 'http://localhost:5173', // Tu URL de Vite/React
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Corregido: 'credentials' en minúscula
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Servidor de AgroGestión corriendo en: ${await app.getUrl()}`);
}
bootstrap();