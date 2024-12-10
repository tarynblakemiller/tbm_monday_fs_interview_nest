import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../orders/entities/order.entity';
import { MondayService } from '../monday/monday.service';
import {
  MondayWebhookPayload,
  MondayWebhookEvent,
  MondayWebhookResponse,
} from './types/monday-webhook.types';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MondayWebhookService {
  private readonly logger = new Logger(MondayWebhookService.name);

  private readonly webhookSecret = process.env.MONDAY_WEBHOOK_SECRET;

  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    private mondayService: MondayService,
    private configService: ConfigService,
  ) {}

  async processWebhook(
    payload: MondayWebhookPayload,
    signature: string,
  ): Promise<MondayWebhookResponse> {
    this.verifySignature(JSON.stringify(payload), signature);

    if ('challenge' in payload) {
      return { challenge: payload.challenge };
    }
    const { event } = payload;

    try {
      switch (event.type) {
        case 'create_pulse':
          await this.handleItemCreation(event);
          break;
        case 'update_column_value':
          await this.handleColumnChange(event);
          break;
        case 'create_update':
          await this.handleUpdateCreation(event);
          break;
        case 'delete_pulse':
          await this.handleItemDeletion(event);
          break;
        default:
          this.logger.warn(`Unhandled event type: ${event.type}`);
      }

      return {
        success: true,
        message: `Successfully processed ${event.type} event`,
      };
    } catch (error) {
      console.error('Webhook processing error:', {
        error: error.message,
        payload,
        signature,
      });
      this.logger.error(
        `Error processing webhook: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to process webhook: ${error.message}`,
      );
    }
  }

  private verifySignature(payload: string, signature: string): void {
    const secret = this.configService.getOrThrow('MONDAY_WEBHOOK_SECRET');
    const hmac = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('base64');

    if (signature !== hmac) {
      throw new BadRequestException('Invalid signature');
    }
  }

  private async handleItemCreation(event: MondayWebhookEvent): Promise<void> {
    this.logger.debug(`Processing item creation: ${event.pulseId}`);

    try {
      await this.orderModel.create({
        monday_item_id: event.pulseId.toString(),
        boardId: event.boardId.toString(),
        itemName: event.pulseName || `Item ${event.pulseId}`,
        columnValues: event.columnValues || {},
        groupId: event.groupId,
        createdAt: new Date(event.triggerTime),
        updatedAt: new Date(event.triggerTime),
      });

      this.logger.debug(`Successfully created order for item ${event.pulseId}`);
    } catch (error) {
      this.logger.error(
        `Failed to create order for item ${event.pulseId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleColumnChange(event: MondayWebhookEvent): Promise<void> {
    this.logger.debug(
      `Processing column change for item ${event.pulseId}, column ${event.columnId}`,
    );

    if (!event.columnId || !event.value) {
      throw new BadRequestException('Missing required column data');
    }

    try {
      await this.orderModel.update(
        {
          columnValues: {
            [event.columnId]: this.processColumnValue(
              event.columnType,
              event.value,
            ),
          },
          updatedAt: new Date(event.triggerTime),
        },
        {
          where: { monday_item_id: event.pulseId.toString() },
        },
      );

      this.logger.debug(
        `Successfully updated column ${event.columnId} for item ${event.pulseId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update column ${event.columnId} for item ${event.pulseId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private async handleUpdateCreation(event: MondayWebhookEvent): Promise<void> {
    this.logger.debug(`Processing update creation for item ${event.pulseId}`);

    if (!event.body) {
      throw new BadRequestException('Missing update content');
    }

    try {
      // Log the update or handle it according to your needs
      this.logger.debug(
        `Update received for item ${event.pulseId}: ${event.textBody}`,
      );

      // Optionally store updates in your database
      // await this.orderModel.update(
      //   {
      //     updates: sequelize.fn('array_append', sequelize.col('updates'), {
      //       id: event.updateId,
      //       content: event.textBody,
      //       createdAt: event.triggerTime
      //     })
      //   },
      //   {
      //     where: { monday_item_id: event.pulseId.toString() }
      //   }
      // );
    } catch (error) {
      this.logger.error(
        `Failed to process update for item ${event.pulseId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private processColumnValue(columnType: string | undefined, value: any): any {
    if (!columnType || !value) return value;

    switch (columnType) {
      case 'date':
        return value.date ? new Date(value.date).toISOString() : null;
      case 'color':
        return value.label?.text || value;
      case 'numeric':
        return Number(value) || 0;
      case 'text':
      case 'long-text':
        return value.text || value;
      default:
        return value;
    }
  }

  private async handleItemDeletion(event: MondayWebhookEvent): Promise<void> {
    this.logger.debug(`Processing item deletion: ${event.pulseId}`);

    try {
      const deleted = await this.orderModel.destroy({
        where: { monday_item_id: event.pulseId.toString() },
      });

      if (deleted) {
        this.logger.debug(
          `Successfully deleted order for item ${event.pulseId}`,
        );
      } else {
        this.logger.warn(`No order found to delete for item ${event.pulseId}`);
      }
    } catch (error) {
      this.logger.error(
        `Failed to delete order for item ${event.pulseId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
