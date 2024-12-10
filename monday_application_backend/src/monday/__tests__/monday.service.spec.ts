// import { Test } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { createTestModule } from '../test/monday-test.module';
import { MondayService } from '../monday.service';
import { MockMondayService } from '../__mocks__/mock-monday.service';
import { MockWebhookServer } from '../__mocks__/mock-webhook.server';

describe('MondayService', () => {
  let mondayService: MondayService;
  let mockMondayService: MockMondayService;
  let cacheManager: any;
  let webhookServer: MockWebhookServer;

  beforeAll(async () => {
    webhookServer = new MockWebhookServer();
    await webhookServer.start();
  });

  afterAll(async () => {
    await webhookServer.stop();
  });

  beforeEach(async () => {
    const module = await createTestModule();
    mondayService = module.get<MondayService>(MondayService);
    mockMondayService = mondayService as unknown as MockMondayService;
    cacheManager = module.get(CACHE_MANAGER);

    mockMondayService.clearAll();
    webhookServer.clearWebhookCalls();
  });

  describe('getBoardItems', () => {
    it('should return cached data when available', async () => {
      const mockData = { id: 'board1', items: [] };
      await cacheManager.set('board_items_board1', mockData);

      const result = await mondayService.getBoardItems('board1');
      expect(result).toEqual(mockData);
    });

    it('should fetch and cache new data when cache is empty', async () => {
      const result = await mondayService.getBoardItems('board1');

      expect(result).toBeDefined();
      const cachedData = await cacheManager.get('board_items_board1');
      expect(cachedData).toEqual(result);
    });
  });

  describe('webhook handling', () => {
    it('should create and trigger webhooks', async () => {
      const webhookUrl = `http://localhost:${webhookServer.getPort()}`;

      // Create webhook
      const webhookResult = await mondayService.createWebhook({
        boardId: 'board1',
        url: webhookUrl,
        event: 'create_item',
      });

      expect(webhookResult).toBeDefined();
      expect(webhookResult.board_id).toBe('board1');

      // Create item to trigger webhook
      const item = await mondayService.createItem({
        boardId: 'board1',
        columnValues: { status: 'New' },
      });

      // Wait for webhook to be processed
      await new Promise((resolve) => setTimeout(resolve, 100));

      const webhookCalls = webhookServer.getWebhookCalls();
      expect(webhookCalls).toHaveLength(1);
      expect(webhookCalls[0].body.event).toBe('create_item');
      expect(webhookCalls[0].body.payload.boardId).toBe('board1');
      expect(item.id).toBeDefined();
    });
  });
});
