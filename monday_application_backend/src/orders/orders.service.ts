import { Injectable } from '@nestjs/common';
import { MondayService } from '../monday/monday.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrderService {
  constructor(
    private readonly mondayService: MondayService,
    private readonly configService: ConfigService,
  ) {}

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
