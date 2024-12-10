import { Test, TestingModule } from '@nestjs/testing';
import { MondayWebhookController } from '../../webhook-handler/monday-webhook.controller';
import { MondayWebhookService } from '../../webhook-handler/monday-webhook.service';
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/sequelize';
import { Order } from '../../orders/entities/order.entity';
import { MondayService } from '../../monday/monday.service';
import { MondayWebhookPayload } from 'src/webhook-handler/types/monday-webhook.types';

describe('MondayWebhookController', () => {
  let controller: MondayWebhookController;
  let service: MondayWebhookService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MondayWebhookController],
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
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    controller = module.get<MondayWebhookController>(MondayWebhookController);
    service = module.get<MondayWebhookService>(MondayWebhookService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should handle challenge requests', async () => {
      const challengePayload = {
        challenge: 'test-challenge',
      };

      const result = await controller.handleWebhook(
        'test-signature',
        challengePayload,
      );

      expect(result).toEqual({ challenge: 'test-challenge' });
    });

    it('should process create_pulse events', async () => {
      const createEventPayload: MondayWebhookPayload = {
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

      jest.spyOn(service, 'processWebhook').mockResolvedValue({
        success: true,
        message: 'Successfully processed create_pulse event',
      });

      const result = await controller.handleWebhook(
        'test-signature',
        createEventPayload,
      );

      expect(result).toEqual({
        success: true,
        message: 'Successfully processed create_pulse event',
      });
      expect(service.processWebhook).toHaveBeenCalledWith(
        createEventPayload,
        'test-signature',
      );
    });

    it('should handle missing signature header', async () => {
      const payload: MondayWebhookPayload = {
        event: {
          type: 'create_pulse',
          pulseId: 123,
          userId: 9603417,
          originalTriggerUuid: null,
          boardId: 456,
          app: 'monday',
          triggerTime: new Date().toISOString(),
          subscriptionId: 73759690,
          triggerUuid: 'test-uuid',
        },
      };

      await expect(controller.handleWebhook('', payload)).rejects.toThrow();
    });
  });
});
