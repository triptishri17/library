import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // =========================================================
  // 🌐 CORS CONFIG (SAFE FOR LOCAL + VERCEL)
  // =========================================================
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // Postman / server calls

      try {
        const hostname = new URL(origin).hostname;

        const allowed =
          hostname === 'localhost' ||
          hostname === '127.0.0.1' ||
          hostname.endsWith('.vercel.app');

        if (allowed) {
          return callback(null, true);
        }

        console.log('❌ Blocked by CORS:', origin);
        return callback(new Error('Not allowed by CORS'));
      } catch (err) {
        console.log('Invalid origin:', origin);
        return callback(new Error('Invalid origin'));
      }
    },
    credentials: true,
  });

  // =========================================================
  // ⚡ GLOBAL VALIDATION PIPE (IMPORTANT FIX HERE)
  // =========================================================
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // ✅ REQUIRED for @Transform in DTOs
      whitelist: true, // remove unknown fields
      forbidNonWhitelisted: false,
    }),
  );

  // =========================================================
  // 🧠 GLOBAL FILTER + INTERCEPTOR
  // =========================================================
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // =========================================================
  // 📁 STATIC FILES (UPLOADS)
  // =========================================================
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // =========================================================
  // 🔗 GLOBAL PREFIX
  // =========================================================
  app.setGlobalPrefix('api');

  // =========================================================
  // 📘 SWAGGER CONFIG
  // =========================================================
  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription('Complete Library Management System REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // =========================================================
  // 🚀 START SERVER
  // =========================================================
  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();