import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import { config } from 'aws-sdk';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.CLIENT_URL, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
  app.use(helmet());
  config.update({
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    region: process.env.AWS_REGION,
  });

  await app.listen(parseInt(process.env.PORT) || 5000);
}
bootstrap();
