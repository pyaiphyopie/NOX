import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, raw, type NextFunction, type Request, type Response } from 'express';
import { AppModule } from './app.module';

type RawBodyRequest = Request & { rawBody?: Buffer };

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(
    '/webhooks/payment',
    raw({ type: '*/*' }),
    (req: RawBodyRequest, _res: Response, next: NextFunction) => {
      req.rawBody = req.body as Buffer;
      next();
    },
  );
  app.use((req: Request, res: Response, next: NextFunction) => {
    if ((req.originalUrl ?? req.url ?? '').startsWith('/webhooks/payment')) return next();
    return json()(req, res, next);
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
