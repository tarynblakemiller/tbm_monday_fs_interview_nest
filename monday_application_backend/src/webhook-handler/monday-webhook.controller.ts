import {
  Controller,
  Body,
  Post,
  Headers,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { MondayWebhookService } from './monday-webhook.service';
import {
  MondayWebhookPayload,
  MondayWebhookResponse,
} from './types/monday-webhook.types';

@Controller('webhooks/monday')
export class MondayWebhookController {
  private readonly logger = new Logger(MondayWebhookController.name);

  constructor(private readonly webhookService: MondayWebhookService) {}

  @Post()
  async handleWebhook(
    @Headers('x-monday-signature') signature: string,
    @Body() payload: MondayWebhookPayload,
  ): Promise<MondayWebhookResponse> {
    try {
      if ('challenge' in payload) {
        this.logger.debug('Received challenge request');
        return { challenge: payload.challenge };
      }

      if (!signature) {
        throw new UnauthorizedException('Missing signature header');
      }

      // Process the webhook event
      await this.webhookService.processWebhook(payload, signature);

      return {
        success: true,
        message: `Successfully processed ${payload.event.type} event`,
      };
    } catch (error) {
      this.logger.error(
        `Webhook processing error: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new BadRequestException('Failed to process webhook');
    }
  }
}
