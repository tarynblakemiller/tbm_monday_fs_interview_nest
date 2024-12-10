import {
  Controller,
  Body,
  Post,
  Get,
  Headers,
  Query,
  BadRequestException,
} from '@nestjs/common';
// import {
//   MondayWebhookPayload,
//   MondayWebhookChallenge,
// } from './types/monday-webhook.types';
import { MondayWebhookService } from './monday-webhook.service';

@Controller('/')
export class MondayChallengeController {
  @Post()
  challenge() {
    return this.challenge;
  }
}

@Controller('webhooks/monday')
export class MondayWebhookController {
  constructor(private readonly webhookService: MondayWebhookService) {}

  @Get()
  async handleWebhook(
    @Body()
    payload: {
      boardId: string;
      config: any;
      connections: {
        webhooks: {
          method: string;
          url: string;
        };
      };
      options: any;
      recipeId: number;
      recipeKind: string;
      token: string;
    },
    @Headers('authorization') signature?: string,
  ) {
    if ('challengeId' in payload && 'challengeType' in payload) {
      console.log('Received challenge request:', payload);
      return { challenge: payload.challengeId };
    }

    if (!signature) {
      throw new BadRequestException('Missing signature header');
    }

    try {
      const rawPayload = JSON.stringify(payload);
      await this.webhookService.handleWebhook(rawPayload, signature);
      return { success: true };
    } catch (error) {
      console.error('Webhook processing error:', error);
      throw error;
    }
  }

  @Post('test')
  async testWebhook() {
    const boardId = process.env.MONDAY_BOARD_ID;
    if (!boardId) {
      throw new BadRequestException('MONDAY_BOARD_ID not configured');
    }
    return { message: 'Webhook endpoint is working' };
  }
}
