import { Injectable } from '@nestjs/common';
import { MondayService } from '../monday/monday.service';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from './entities/order.entity';

@Injectable()
export class OrderService {
  constructor(
    private readonly mondayService: MondayService,
    private readonly configService: ConfigService,
    @InjectModel(Order)
    private orderModel: typeof Order,
  ) {}

  async createLocalOrder(data: {
    boardId: string;
    itemName: string;
    columnValues: Record<string, any>;
    groupId?: string;
  }) {
    try {
      return await this.orderModel.create(data);
    } catch (error) {
      console.error('Create local order error:', error);
      throw error;
    }
  }

  async createOrder(data: {
    boardId: string;
    columnValues: Record<string, any>;
    groupId?: string;
  }) {
    return this.mondayService.createItem(data);
  }

  async getOrders() {
    const boardId = this.configService.get('MONDAY_BOARD_ID');
    if (!boardId) throw new Error('MONDAY_BOARD_ID not configured');

    return this.mondayService.getBoardItems(boardId);
  }

  async deleteOrder(itemId: string) {
    return this.mondayService.deleteItem(itemId);
  }
}
