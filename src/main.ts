import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: "http://localhost:5173", // Adjust this based on your frontend URL
    credentials: true, // Allow sending cookies (refresh token)
    allowedHeaders: ["Content-Type", "Authorization"], //  Ensure Authorization header is allowed
  });


  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();