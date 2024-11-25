import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Order } from '../orders/entities/order.entity';
import { MondayService } from '../monday/monday.service';
import {
  MondayWebhookPayload,
  MondayWebhookEvent,
  MondayWebhookChallenge,
  MondayColumnType,
} from './types/monday-webhook.types';
import * as crypto from 'crypto';

@Injectable()
export class MondayWebhookService {
  private readonly webhookSecret = process.env.MONDAY_WEBHOOK_SECRET;

  constructor(
    @InjectModel(Order)
    private orderModel: typeof Order,
    private mondayService: MondayService,
  ) {}

  private validateSignature(rawPayload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      throw new Error('MONDAY_WEBHOOK_SECRET not configured');
    }

    const hmac = crypto.createHmac('sha256', this.webhookSecret);
    const digest = hmac.update(rawPayload).digest('base64');
    return signature === digest;
  }

  private isChallenge(payload: any): payload is MondayWebhookChallenge {
    return 'challengeId' in payload && 'challengeType' in payload;
  }

  private validateColumnValue(type: MondayColumnType, value: any): boolean {
    if (!value) return false;

    switch (type) {
      case 'status':
        return typeof value.label === 'string';
      case 'text':
        return (
          typeof value.text === 'string' || typeof value.value === 'string'
        );
      case 'numeric':
        return !isNaN(Number(value.value));
      case 'date':
        return !isNaN(Date.parse(value.value));
      case 'dropdown':
        return Array.isArray(value.value) || typeof value.value === 'string';
      case 'color':
        return typeof value.value === 'string';
      default:
        return true;
    }
  }

  private processColumnValue(type: MondayColumnType, value: any): any {
    switch (type) {
      case 'status':
        return value.label;
      case 'numeric':
        return Number(value.value);
      case 'date':
        return value.value ? new Date(value.value).toISOString() : null;
      case 'text':
        return value.text || value.value;
      case 'dropdown':
        return Array.isArray(value.value) ? value.value : [value.value];
      case 'color':
        return value.value;
      default:
        return value.value || value.text || value.label;
    }
  }

  private async handleColumnChange(event: MondayWebhookEvent): Promise<void> {
    const { itemId, columnId, columnType, value } = event;

    if (!itemId || !columnId || !value) {
      throw new BadRequestException('Missing required webhook data');
    }

    if (!this.validateColumnValue(columnType as MondayColumnType, value)) {
      throw new BadRequestException(
        `Invalid value for column type ${columnType}`,
      );
    }

    try {
      const processedValue = this.processColumnValue(
        columnType as MondayColumnType,
        value,
      );

      await this.orderModel.update(
        {
          columnValues: {
            [columnId]: processedValue,
          },
          updatedAt: new Date(),
        },
        {
          where: { monday_item_id: itemId.toString() },
        },
      );

      console.log(
        `Updated ${columnType} column ${columnId} for item ${itemId} with value:`,
        processedValue,
      );
    } catch (error) {
      console.error(
        `Failed to sync column ${columnId} for item ${itemId}:`,
        error,
      );
      throw error;
    }
  }

  private async handleItemCreation(event: MondayWebhookEvent): Promise<void> {
    const { itemId, boardId } = event;

    try {
      // Fetch the complete item details from Monday.com
      const boardData = await this.mondayService.getBoardItems(
        boardId.toString(),
      );
      const item = boardData?.items?.find(
        (i: { id: string }) => i.id === itemId.toString(),
      );

      if (!item) {
        throw new BadRequestException(
          `Item ${itemId} not found on board ${boardId}`,
        );
      }

      // Create a new order record
      await this.orderModel.create({
        monday_item_id: itemId.toString(),
        boardId: boardId.toString(),
        itemName: item.name,
        columnValues: {},
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log(
        `Created new order record for item ${itemId} on board ${boardId}`,
      );
    } catch (error) {
      console.error(`Failed to handle item creation for ${itemId}:`, error);
      throw error;
    }
  }

  async handleWebhook(rawPayload: string, signature: string): Promise<void> {
    if (!this.validateSignature(rawPayload, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    const payload: MondayWebhookPayload = JSON.parse(rawPayload);

    if (this.isChallenge(payload)) {
      console.log('Handling challenge request:', payload.challengeId);
      return;
    }

    const { event } = payload;

    try {
      switch (event.type) {
        case 'change_column_value':
          await this.handleColumnChange(event);
          break;
        case 'create_item':
          await this.handleItemCreation(event);
          break;
        case 'create_update':
          console.log('Update created:', event);
          break;
        case 'change_status':
          await this.handleColumnChange(event); // Reuse column change handler
          break;
        case 'delete_item':
          await this.handleItemDeletion(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }

  private async handleItemDeletion(event: MondayWebhookEvent): Promise<void> {
    const { itemId } = event;

    try {
      await this.orderModel.destroy({
        where: { monday_item_id: itemId.toString() },
      });
      console.log(`Deleted order record for item ${itemId}`);
    } catch (error) {
      console.error(`Failed to handle item deletion for ${itemId}:`, error);
      throw error;
    }
  }
}
