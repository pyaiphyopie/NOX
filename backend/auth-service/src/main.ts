import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:8080',
    ],
    credentials: true,
  });

  const port = process.env.AUTH_SERVICE_PORT || 3001;
  await app.listen(port);
  logger.log(`NOX Auth Service running on port ${port}`);
  logger.log(`Endpoints under /api/v1/auth/*`);
}

bootstrap();
