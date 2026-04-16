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

  // ✅ FIXED CORS (handles Vercel + localhost properly)
  app.enableCors({
    origin: (origin, callback) => {
      // allow requests like Postman / server-side (no origin)
      if (!origin) return callback(null, true);

      try {
        const url = new URL(origin);
        const hostname = url.hostname;

        const isAllowed =
          hostname === 'localhost' ||       
          hostname === '127.0.0.1' ||       
          hostname.endsWith('.vercel.app'); 

        if (isAllowed) {
          return callback(null, true);
        }
      } catch (err) {
        console.log('Invalid origin:', origin);
      }

      console.log('❌ Blocked by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

 
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });


  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription('Complete Library Management System REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 5000;
  await app.listen(port);

  console.log(`🚀 API running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();