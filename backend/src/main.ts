import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('HR Management API')
    .setDescription('Employee management system REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const dataSource = app.get(DataSource);

  if (dataSource.isInitialized) {
    console.log('Database connected successfully');
  } else {
    console.log('Database connection failed');
  }

  const port = process.env.PORT ?? 5000;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
