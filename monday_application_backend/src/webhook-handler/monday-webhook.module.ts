import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Order } from '../orders/entities/order.entity';
import { MondayWebhookController } from './monday-webhook.controller';
import { MondayWebhookService } from './monday-webhook.service';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [SequelizeModule.forFeature([Order]), OrdersModule],
  controllers: [MondayWebhookController],
  providers: [MondayWebhookService],
})
export class MondayWebhookModule {}
