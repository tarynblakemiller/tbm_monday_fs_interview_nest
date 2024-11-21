import { Module } from '@nestjs/common';
import { OrderController } from './orders.controller';
import { OrderService } from './orders.service';
import { MondayClient } from '../monday/client';
import { MondayService } from '../monday/monday.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { OrderFragrance } from './entities/order-fragrance.entity';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from './entities/order.entity';

@Module({
  imports: [ConfigModule, SequelizeModule.forFeature([Order, OrderFragrance])],
  controllers: [OrderController],
  providers: [
    OrderService,
    MondayService,
    {
      provide: MondayClient,
      useFactory: (configService: ConfigService) => {
        console.log('Creating Monday client...');
        return new MondayClient(configService);
      },
      inject: [ConfigService],
    },
  ],
  exports: [MondayClient, MondayService],
})
export class OrdersModule {}
