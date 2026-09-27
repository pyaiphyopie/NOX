import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, raw } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(
    '/webhooks/payment',
    raw({ type: '*/*' }),
    (req: { body?: Buffer; rawBody?: Buffer }, _res, next) => {
      req.rawBody = req.body;
      next();
    },
  );
  app.use((req: { originalUrl?: string; url?: string }, res, next) => {
    if ((req.originalUrl ?? req.url ?? '').startsWith('/webhooks/payment')) return next();
    return json()(req as never, res as never, next);
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true,
  });

  const port = Number(process.env.API_PORT || 3002);
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`NOX API (payments P0) on ${port}`);
}

bootstrap();
