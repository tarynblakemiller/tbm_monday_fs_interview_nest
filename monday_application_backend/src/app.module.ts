import { Module } from '@nestjs/common';
import { FragrancesModule } from './fragrances/fragrances.module';
import { SequelizeModule } from '@nestjs/sequelize';
// import { DatabaseModule } from './database/database.module';
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
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        autoLoadModels: true,
        models: [Fragrance, Order, OrderFragrance],
      }),
    }),
    FragrancesModule,
    OrdersModule,
  ],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
}
