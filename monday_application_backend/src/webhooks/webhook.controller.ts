// import { Controller, Post, Body, Headers } from '@nestjs/common';
// import { WebhookService } from './webhook.service';
// import { MondayWebhookPayload } from './types';

// @Controller('webhooks/monday')
// export class WebhookController {
//   constructor(private readonly webhookService: WebhookService) {}

//   @Post()
//   async handleWebhook(
//     @Body() payload: MondayWebhookPayload,
//     @Headers('authorization') authorization: string,
//   ) {
//     if (payload.challenge) {
//       return { challenge: payload.challenge };
//     }

//     return this.webhookService.processWebhook(payload);
//   }
// }
