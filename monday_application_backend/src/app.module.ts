import { Module } from '@nestjs/common';
import { FragrancesModule } from './fragrances/fragrances.module';
import { SequelizeModule } from '@nestjs/sequelize';
import {
  appConfig,
  databaseConfig,
  mondayConfig,
} from './config/database.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrdersModule } from './orders/orders.module';
import { Order } from './orders/entities/order.entity';
import { Fragrance } from './fragrances/entities/fragrance.entity';
import { OrderFragrance } from './orders/entities/order-fragrance.entity';
import { SEQUELIZE } from './constants/sequelize.constant';
import { Sequelize } from 'sequelize-typescript';
import { MondayWebhookModule } from './webhook-handler/monday-webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [databaseConfig, mondayConfig, appConfig],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
      isGlobal: true,
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
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
}
