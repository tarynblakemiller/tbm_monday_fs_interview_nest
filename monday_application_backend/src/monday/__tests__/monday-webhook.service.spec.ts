// monday-webhook.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { MondayWebhookService } from '../../webhook-handler/monday-webhook.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { Order } from '../../orders/entities/order.entity';
import { MondayService } from '../../monday/monday.service';
import { MockWebhookServer } from '../__mocks__/mock-webhook.server';
import * as crypto from 'crypto';
import { MondayWebhookPayload } from 'src/webhook-handler/types/monday-webhook.types';

describe('MondayWebhookService', () => {
  let service: MondayWebhookService;
  let orderModel: any;
  let webhookServer: MockWebhookServer;
  const TEST_SECRET = 'test-webhook-secret';

  beforeAll(async () => {
    webhookServer = new MockWebhookServer();
    await webhookServer.start();
  });

  afterAll(async () => {
    await webhookServer.stop();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MondayWebhookService,
        {
          provide: getModelToken(Order),
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            destroy: jest.fn(),
          },
        },
        {
          provide: MondayService,
          useValue: {
            getBoardItems: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue(TEST_SECRET),
          },
        },
      ],
    }).compile();

    service = module.get<MondayWebhookService>(MondayWebhookService);
    orderModel = module.get(getModelToken(Order));
    // mondayService = module.get(MondayService);

    webhookServer.clearWebhookCalls();
  });

  function generateSignature(payload: any): string {
    const hmac = crypto.createHmac('sha256', TEST_SECRET);
    return hmac.update(JSON.stringify(payload)).digest('base64');
  }

  describe('processWebhook', () => {
    it('should handle challenge requests', async () => {
      const payload: MondayWebhookPayload = {
        challenge: 'test-challenge',
        challengeType: 'webhook_challenge',
        type: 'challenge',
      };
      const signature = generateSignature(payload);

      const result = await service.processWebhook(payload, signature);

      expect(result).toEqual({
        challenge: 'test-challenge',
      });
    });

    it('should handle item creation', async () => {
      const payload: MondayWebhookPayload = {
        event: {
          type: 'create_pulse',
          userId: 9603417,
          originalTriggerUuid: null,
          boardId: 456,
          pulseId: 123,
          pulseName: 'Test Item',
          groupId: 'topics',
          app: 'monday',
          triggerTime: new Date().toISOString(),
          subscriptionId: 73759690,
          triggerUuid: 'test-uuid',
        },
      };
      const signature = generateSignature(payload);

      orderModel.create.mockResolvedValue({});

      const result = await service.processWebhook(payload, signature);

      expect(result).toEqual({
        success: true,
        message: 'Successfully processed create_pulse event',
      });
    });

    it('should handle column value changes', async () => {
      const now = new Date().toISOString();
      const payload: MondayWebhookPayload = {
        event: {
          type: 'update_column_value',
          userId: 9603417,
          originalTriggerUuid: null,
          boardId: 456,
          pulseId: 123,
          columnId: 'status',
          columnType: 'status',
          value: {
            label: {
              index: 1,
              text: 'Done',
              style: {
                color: '#00ff00',
                border: '#00cc00',
                var_name: 'positive',
              },
            },
          },
          app: 'monday',
          triggerTime: now,
          subscriptionId: 73759690,
          triggerUuid: 'test-uuid',
        },
      };
      const signature = generateSignature(payload);

      orderModel.update.mockResolvedValue([1]);

      const result = await service.processWebhook(payload, signature);

      expect(result).toEqual({
        success: true,
        message: 'Successfully processed update_column_value event',
      });
    });

    it('should handle item deletion', async () => {
      const payload: MondayWebhookPayload = {
        event: {
          type: 'delete_pulse',
          userId: 9603417,
          originalTriggerUuid: null,
          boardId: 456,
          pulseId: 123,
          app: 'monday',
          triggerTime: new Date().toISOString(),
          subscriptionId: 73759690,
          triggerUuid: 'test-uuid',
        },
      };
      const signature = generateSignature(payload);

      orderModel.destroy.mockResolvedValue(1);

      const result = await service.processWebhook(payload, signature);

      expect(result).toEqual({
        success: true,
        message: 'Successfully processed delete_pulse event',
      });
    });

    it('should reject invalid signatures', async () => {
      const payload: MondayWebhookPayload = {
        event: {
          type: 'create_pulse',
          userId: 9603417,
          originalTriggerUuid: null,
          boardId: 456,
          pulseId: 123,
          app: 'monday',
          triggerTime: new Date().toISOString(),
          subscriptionId: 73759690,
          triggerUuid: 'test-uuid',
        },
      };

      await expect(
        service.processWebhook(payload, 'invalid-signature'),
      ).rejects.toThrow('Invalid signature');
    });

    it('should integrate with mock webhook server', async () => {
      const webhookUrl = `http://localhost:${webhookServer.getPort()}`;
      const payload: MondayWebhookPayload = {
        event: {
          type: 'create_pulse',
          userId: 9603417,
          originalTriggerUuid: null,
          boardId: 456,
          pulseId: 123,
          app: 'monday',
          triggerTime: new Date().toISOString(),
          subscriptionId: 73759690,
          triggerUuid: 'test-uuid',
        },
      };

      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-monday-signature': generateSignature(payload),
        },
        body: JSON.stringify(payload),
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      const webhookCalls = webhookServer.getWebhookCalls();
      expect(webhookCalls).toHaveLength(1);
      expect(webhookCalls[0].body).toEqual(payload);
    });
  });
});
