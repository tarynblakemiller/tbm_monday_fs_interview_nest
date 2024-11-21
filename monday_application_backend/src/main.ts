import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { SEQUELIZE } from './constants/sequelize.constant';
import { up as seedFragrances } from './database/seeds/fragrances.seed';
// import { NestExpressApplication } from '@nestjs/platform-express';
// import { NextFunction, Request, Response } from 'express';
import fragranceMigration from './database/migrations/20241120033806-create-fragrances';
import orderMigration from './database/migrations/20240420000000-create-orders';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.enableCors({
    origin: 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');
  await app.listen(8080);

  const sequelize = app.get(SEQUELIZE);

  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('Starting database initialization...');
      const queryInterface = sequelize.getQueryInterface();

      console.log('Dropping schema...');
      await queryInterface.dropSchema('public', {});

      console.log('Creating schema...');
      await queryInterface.createSchema('public');

      console.log('Running migrations...');
      await fragranceMigration.up(queryInterface);
      await orderMigration.up(queryInterface);

      console.log('Running seeds...');
      await seedFragrances(queryInterface);

      console.log('Database initialization complete');

      const tableCheck = await queryInterface.showAllTables();
      console.log('Available tables:', tableCheck);

      const results = await sequelize.query('SELECT * FROM fragrances');
      console.log('Fragrance records:', results[0]);

      const tableDescription = await queryInterface.describeTable('fragrances');
      console.log('Table structure:', tableDescription);
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  const config = new DocumentBuilder()
    .setTitle('Candle Production Api')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
bootstrap();
