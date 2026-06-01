import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { isAllowedCorsOrigin } from './common/cors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: (origin, callback) => {
      callback(null, isAllowedCorsOrigin(origin));
    },
    credentials: true,
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: false }),
  );

  const port = Number(process.env.BACKEND_PORT || 4000);
  const host = process.env.BACKEND_HOST || '0.0.0.0';
  await app.listen(port, host);
  // eslint-disable-next-line no-console
  console.log(`Backend API running on http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/api`);
  if (host === '0.0.0.0') {
    // eslint-disable-next-line no-console
    console.log('LAN: use http://<your-ip>:4000/api from other devices');
  }
}

bootstrap();
