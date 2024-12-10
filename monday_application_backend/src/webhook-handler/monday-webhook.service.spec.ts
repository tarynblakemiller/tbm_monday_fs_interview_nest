import { Test, TestingModule } from '@nestjs/testing';
// import { BadRequestException } from '@nestjs/common';
import { MondayWebhookService } from './monday-webhook.service';
import { Order } from '../orders/entities/order.entity';
import { MondayService } from '../monday/monday.service';
import { getModelToken } from '@nestjs/sequelize';
import * as crypto from 'crypto';

describe('MondayWebhookService', () => {
  let service: MondayWebhookService;

  const mockOrderModel = {
    update: jest.fn(),
    findOne: jest.fn(),
  };

  const mockMondayService = {
    getBoardItems: jest.fn(),
    updateItem: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MondayWebhookService,
        {
          provide: getModelToken(Order),
          useValue: mockOrderModel,
        },
        {
          provide: MondayService,
          useValue: mockMondayService,
        },
      ],
    }).compile();

    service = module.get<MondayWebhookService>(MondayWebhookService);
    process.env.MONDAY_WEBHOOK_SECRET = 'test-secret';
    process.env.MONDAY_BOARD_ID = '1234567890';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should validate correct signature', async () => {
    const payload = JSON.stringify({
      event: {
        type: 'change_column_value',
        boardId: '1234567890',
        itemId: 123456789,
        columnId: 'status',
        columnType: 'status',
        value: { label: 'Done', index: 1 },
      },
    });

    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update(payload)
      .digest('hex');

    await expect(
      service.handleWebhook(payload, signature),
    ).resolves.not.toThrow();
  });

  it('should reject invalid signature', async () => {
    const payload = JSON.stringify({
      event: {
        type: 'change_column_value',
        boardId: '1234567890',
        itemId: 123456789,
        columnId: 'status',
        columnType: 'status',
        value: { label: 'Done', index: 1 },
      },
    });

    await expect(
      service.handleWebhook(payload, 'invalid-signature'),
    ).rejects.toThrow('Invalid webhook signature');
  });

  it('should reject webhook from incorrect board', async () => {
    const payload = JSON.stringify({
      event: {
        type: 'change_column_value',
        boardId: 'wrong-board',
        itemId: 123456789,
        columnId: 'status',
        columnType: 'status',
        value: { label: 'Done', index: 1 },
      },
    });

    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update(payload)
      .digest('hex');

    await expect(service.handleWebhook(payload, signature)).rejects.toThrow(
      'Webhook from unexpected board',
    );
  });

  it('should handle status column change', async () => {
    const payload = JSON.stringify({
      event: {
        type: 'change_column_value',
        boardId: '1234567890',
        itemId: 123456789,
        columnId: 'status',
        columnType: 'status',
        value: { label: 'Done', index: 1 },
      },
    });

    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update(payload)
      .digest('hex');

    await service.handleWebhook(payload, signature);

    expect(mockOrderModel.update).toHaveBeenCalledWith(
      {
        columnValues: { status: 'Done' },
        updatedAt: expect.any(Date),
      },
      {
        where: { monday_item_id: '123456789' },
      },
    );
  });

  it('should handle numeric column change', async () => {
    const payload = JSON.stringify({
      event: {
        type: 'change_column_value',
        boardId: '1234567890',
        itemId: 123456789,
        columnId: 'quantity',
        columnType: 'numeric',
        value: { value: '42' },
      },
    });

    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update(payload)
      .digest('hex');

    await service.handleWebhook(payload, signature);

    expect(mockOrderModel.update).toHaveBeenCalledWith(
      {
        columnValues: { quantity: 42 },
        updatedAt: expect.any(Date),
      },
      {
        where: { monday_item_id: '123456789' },
      },
    );
  });

  it('should handle challenge request', async () => {
    const payload = JSON.stringify({
      challengeId: '1234567890',
      challengeType: 'WebhookURLVerification',
    });

    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update(payload)
      .digest('hex');

    await expect(
      service.handleWebhook(payload, signature),
    ).resolves.not.toThrow();
  });

  it('should reject invalid column value', async () => {
    const payload = JSON.stringify({
      event: {
        type: 'change_column_value',
        boardId: '1234567890',
        itemId: 123456789,
        columnId: 'status',
        columnType: 'status',
        value: null,
      },
    });

    const signature = crypto
      .createHmac('sha256', 'test-secret')
      .update(payload)
      .digest('hex');

    await expect(service.handleWebhook(payload, signature)).rejects.toThrow(
      'Invalid value for column type status',
    );
  });

  describe('error handling', () => {
    it('should throw error if webhook secret not configured', async () => {
      process.env.MONDAY_WEBHOOK_SECRET = '';

      const payload = JSON.stringify({ event: {} });
      const signature = 'some-signature';

      await expect(service.handleWebhook(payload, signature)).rejects.toThrow(
        'MONDAY_WEBHOOK_SECRET not configured',
      );
    });

    it('should handle database update errors', async () => {
      mockOrderModel.update.mockRejectedValueOnce(new Error('DB Error'));

      const payload = JSON.stringify({
        event: {
          type: 'change_column_value',
          boardId: '1234567890',
          itemId: 123456789,
          columnId: 'status',
          columnType: 'status',
          value: { label: 'Done', index: 1 },
        },
      });

      const signature = crypto
        .createHmac('sha256', 'test-secret')
        .update(payload)
        .digest('hex');

      await expect(service.handleWebhook(payload, signature)).rejects.toThrow();
    });
  });
});
