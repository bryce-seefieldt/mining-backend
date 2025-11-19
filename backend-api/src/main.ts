import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Global Validation (Whitelist removes unknown properties from requests)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // 2. Setup Swagger (API Documentation)
  const config = new DocumentBuilder()
    .setTitle('Commercial Microservice API')
    .setDescription('Financial Data API')
    .setVersion('1.0')
    .addBearerAuth() // Adds the "Authorize" button for JWTs
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // 3. Enable CORS (Crucial for frontend communication)
  app.enableCors();

  await app.listen(process.env.PORT || 3001);
}
bootstrap();