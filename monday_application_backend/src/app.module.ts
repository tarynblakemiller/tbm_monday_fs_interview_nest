import { Module } from '@nestjs/common';
import { FragrancesModule } from './fragrances/fragrances.module';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  appConfig,
  databaseConfig,
  mondayConfig,
} from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { environmentValidationSchema } from './config/database.config';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { Fragrance } from './fragrances/entities/fragrance.entity';
import { OrderFragrance } from './orders/entities/order-fragrance.entity';
import { SEQUELIZE } from './constants/sequelize.constant';
import { Sequelize } from 'sequelize-typescript';
import { MondayWebhookModule } from './webhook-handler/monday-webhook.module';
import { CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, mondayConfig, appConfig],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      validationSchema: environmentValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
      isGlobal: true,
    }),
    CacheModule.register({
      max: 10,
      ttl: 5,
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      retry_strategy: function (times: number) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      onError: (err: string) => {
        console.error('Redis Client Error', err);
      },
      // username: process.env.REDIS_USERNAME, // new property
      // password: process.env.REDIS_PASSWORD, // new property
      // no_ready_check: true, // new property
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        console.log('DB Config:', dbConfig);
        return {
          dialect: 'postgres',
          ...dbConfig,
          define: {
            underscored: false,
            timestamps: true,
          },
          autoLoadModels: true,
          sync: true,
          models: [Fragrance, Order, OrderFragrance],
        };
      },
    }),
    FragrancesModule,
    OrdersModule,
    MondayWebhookModule,
  ],
  providers: [
    {
      provide: SEQUELIZE,
      useExisting: Sequelize,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    this.validateConfig();
  }

  private validateConfig() {
    const requiredConfigs = ['database.host', 'monday.apiToken', 'app.nodeEnv'];

    requiredConfigs.forEach((path) => {
      const value = this.configService.get(path);
      if (!value) {
        throw new Error(`Missing required configuration: ${path}`);
      }
    });
  }
}
