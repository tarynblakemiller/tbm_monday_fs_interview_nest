import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async createOrder(@Body() orderData: CreateOrderDto) {
    try {
      const localOrder = await this.orderService.createLocalOrder(orderData);
      const mondayResponse = await this.orderService.createOrder(orderData);

      return {
        monday: mondayResponse,
        order: localOrder,
      };
    } catch (error) {
      console.error('Order creation error:', error);
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async getOrders() {
    try {
      const orders = await this.orderService.getOrders();
      if (!orders.data.boards[0]?.items?.length) {
        throw new HttpException('No orders found', HttpStatus.NOT_FOUND);
      }
      return orders;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch orders from Monday.com',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async deleteOrder(@Param('id') id: string) {
    try {
      const response = await this.orderService.deleteOrder(id);
      return response;
    } catch (error) {
      throw new HttpException(
        'Failed to delete order from Monday.com',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
