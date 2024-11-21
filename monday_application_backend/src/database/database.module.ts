// import { databaseProviders } from '../providers/database.providers';

import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Fragrance } from '../fragrances/entities/fragrance.entity';
import { Order } from '../orders/entities/order.entity';
import { OrderFragrance } from '../orders/entities/order-fragrance.entity';

@Module({
  imports: [SequelizeModule.forFeature([Fragrance, Order, OrderFragrance])],
  exports: [SequelizeModule],
})
export class DatabaseModule {}
