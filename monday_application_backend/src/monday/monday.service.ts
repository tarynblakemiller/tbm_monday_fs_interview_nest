import { Injectable, Inject } from '@nestjs/common';
import { MondayClient } from './client';
import { queries } from './queries';
import { generateOrderId } from '../utils/generators';
import { Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface CreateItemInput {
  boardId: string;
  columnValues: Record<string, any>;
  groupId?: string;
}

@Injectable()
export class MondayService {
  private readonly logger = new Logger(MondayService.name);
  //5 minutes
  private readonly CACHE_TTL = 300;

  constructor(
    private readonly mondayClient: MondayClient,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async getBoardItems(boardId: string) {
    const cacheKey = `board_items_${boardId}`;

    try {
      // Check cache first
      const cachedData = await this.cacheManager.get<string>(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      const response = await this.mondayClient
        .getClient()
        .query(queries.GET_BOARD_ITEMS.loc?.source.body ?? '', { boardId })
        .toPromise();

      if (response.error) {
        this.logger.error(
          `Failed to get board items: ${response.error.message}`,
          {
            boardId,
            errorDetails: response.error,
          },
        );
        throw new Error(`Failed to get board items: ${response.error.message}`);
      }

      const boardData = response.data?.boards?.[0] ?? null;

      // Cache successful responses
      if (boardData) {
        await this.cacheManager.set(cacheKey, boardData, this.CACHE_TTL);
      }

      return boardData;
    } catch (error) {
      this.logger.error(`Error fetching board items: ${error.message}`, {
        boardId,
        error,
      });
      throw new MondayAPIError(`Failed to fetch board items: ${error.message}`);
    }
  }

  async createItem(data: CreateItemInput) {
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

    try {
      const response = await this.mondayClient
        .getClient()
        .mutation(queries.CREATE_ITEM.loc?.source.body ?? '', variables)
        .toPromise();

      if (response.error) {
        this.logger.error(`Failed to create item: ${response.error.message}`);
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Error creating item: ${error.message}`);
      throw error;
    }
  }

  async deleteItem(itemId: string) {
    try {
      const response = await this.mondayClient
        .getClient()
        .mutation(queries.DELETE_ITEM.loc?.source.body ?? '', { itemId })
        .toPromise();

      if (response.error) {
        this.logger.error(`Failed to delete item: ${response.error.message}`);
        throw new Error(response.error.message);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Error deleting item: ${error.message}`);
      throw error;
    }
  }

  async createWebhook(data: {
    boardId: string;
    url: string;
    event: 'create_item' | 'change_column_value';
  }) {
    const variables = {
      boardId: data.boardId,
      url: data.url,
      event: data.event,
      config: JSON.stringify({}),
    };

    const response = await this.mondayClient
      .getClient()
      .mutation(queries.CREATE_WEBHOOK.loc?.source.body ?? '', variables)
      .toPromise();

    if (response.error) {
      throw new Error(`Failed to create webhook: ${response.error.message}`);
    }

    return response.data;
  }

  // Custom error class for better error handling
}

class MondayAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MondayAPIError';
  }
}
