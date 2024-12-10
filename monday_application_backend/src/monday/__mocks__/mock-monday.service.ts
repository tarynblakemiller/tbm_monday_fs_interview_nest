import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

export interface MockItem {
  id: string;
  name: string;
  boardId: string;
  groupId: string;
  columnValues: Record<string, any>;
}

export interface MockWebhook {
  id: string;
  boardId: string;
  url: string;
  event: 'create_item' | 'change_column_value' | 'delete_item';
}

@Injectable()
export class MockMondayService {
  private boards: Map<string, any> = new Map();
  private items: Map<string, MockItem> = new Map();
  private webhooks: Map<string, MockWebhook> = new Map();
  private mockLatency: number = 100;

  async getBoardItems(boardId: string) {
    await this.simulateLatency();
    return (
      this.boards.get(boardId) || {
        id: boardId,
        name: 'Mock Board',
        groups: [
          {
            id: 'group1',
            title: 'Default Group',
            items: Array.from(this.items.values()).filter(
              (item) => item.boardId === boardId,
            ),
          },
        ],
      }
    );
  }

  async createItem(data: {
    boardId: string;
    columnValues: Record<string, any>;
    groupId?: string;
  }) {
    await this.simulateLatency();
    const itemId = uuidv4();
    const item: MockItem = {
      id: itemId,
      name: `Mock Item ${itemId}`,
      boardId: data.boardId,
      groupId: data.groupId || 'default',
      columnValues: data.columnValues,
    };

    this.items.set(itemId, item);
    await this.triggerWebhook('create_item', item);

    return { id: itemId };
  }

  async deleteItem(itemId: string) {
    await this.simulateLatency();
    const item = this.items.get(itemId);
    if (!item) {
      throw new Error('Item not found');
    }

    this.items.delete(itemId);
    await this.triggerWebhook('delete_item', { itemId });

    return { id: itemId };
  }

  async createWebhook(data: {
    boardId: string;
    url: string;
    event: 'create_item' | 'change_column_value';
  }) {
    await this.simulateLatency();
    const webhookId = uuidv4();
    const webhook: MockWebhook = {
      id: webhookId,
      ...data,
    };

    this.webhooks.set(webhookId, webhook);

    return {
      id: webhookId,
      board_id: data.boardId,
    };
  }

  private async simulateLatency() {
    await new Promise((resolve) => setTimeout(resolve, this.mockLatency));
  }

  private async triggerWebhook(event: string, payload: any) {
    const relevantWebhooks = Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.event === event,
    );

    const webhookPromises = relevantWebhooks.map((webhook) =>
      fetch(webhook.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          payload,
        }),
      }).catch((error) => {
        console.error(`Webhook delivery failed: ${error.message}`);
      }),
    );

    await Promise.all(webhookPromises);
  }

  // Test helpers
  clearAll() {
    this.boards.clear();
    this.items.clear();
    this.webhooks.clear();
  }

  setMockLatency(ms: number) {
    this.mockLatency = ms;
  }

  seedBoard(boardId: string, data: any) {
    this.boards.set(boardId, data);
  }

  getItems() {
    return Array.from(this.items.values());
  }

  getWebhooks() {
    return Array.from(this.webhooks.values());
  }
}
