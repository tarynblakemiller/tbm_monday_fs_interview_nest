import { Injectable } from '@nestjs/common';
import { MondayClient } from './client';
import { queries } from './queries';
import { generateOrderId } from '../utils/generators';

@Injectable()
export class MondayService {
  constructor(private readonly mondayClient: MondayClient) {}

  async createItem(data: {
    boardId: string;
    columnValues: Record<string, any>;
    groupId?: string;
  }) {
    const uniqueID = generateOrderId();
    const variables = {
      boardId: data.boardId,
      groupId: data.groupId || 'topics',
      itemName: uniqueID,
      columnValues:
        typeof data.columnValues === 'string'
          ? data.columnValues
          : JSON.stringify(data.columnValues),
    };

    return this.mondayClient
      .getClient()
      .mutation(queries.CREATE_ITEM.loc?.source.body || '', variables)
      .toPromise();
  }

  async deleteItem(itemId: string) {
    return this.mondayClient
      .getClient()
      .mutation(queries.DELETE_ITEM.loc?.source.body || '', { itemId })
      .toPromise();
  }

  async getBoardItems(boardId: string) {
    return this.mondayClient
      .getClient()
      .query(queries.GET_BOARD_ITEMS.loc?.source.body || '', { boardId })
      .toPromise();
  }
}
