import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, INestApplication } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';

let cachedApp: INestApplication;

export async function bootstrapApp(): Promise<INestApplication> {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule);

    // Security
    app.use(helmet());
    app.enableCors();

    // Performance
    app.use(compression());

    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      transform: true,
    }));

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

// Local development check
if (require.main === module || process.env.NODE_ENV !== 'production') {
  bootstrapApp().then(async (app) => {
    const port = process.env.PORT || 3000;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
  });
}
