// import { Injectable } from '@nestjs/common';
// import { OrderService } from '../orders/orders.service';
// import { MondayWebhookPayload } from './types';

// @Injectable()
// export class WebhookService {
//   constructor(private readonly orderService: OrderService) {}

//   async processWebhook(payload: MondayWebhookPayload) {
//     const { event } = payload;

//     switch (event.type) {
//       case 'item_created':
//         return this.handleItemCreated(event);
//       case 'item_updated':
//         return this.handleItemUpdated(event);
//       default:
//         return { status: 'unhandled_event' };
//     }
//   }

//   private async handleItemCreated(event: MondayWebhookPayload['event']) {
//     const { itemId, boardId, value } = event;

//     try {
//       await this.orderService.createLocalOrder({
//         monday_item_id: itemId.toString(),
//         board_id: boardId.toString(),
//         status: 'NEW',
//         ...value,
//       });

//       return { status: 'processed', itemId };
//     } catch (error) {
//       throw new Error(`Failed to sync item ${itemId}`);
//     }
//   }

//   private async handleItemUpdated(event: MondayWebhookPayload['event']) {
//     const { itemId, value, originalValue } = event;

//     try {
//       await this.orderService.updateLocalOrder(itemId.toString(), {
//         status: value.status,
//         ...value,
//         previous_status: originalValue?.status,
//       });

//       return { status: 'processed', itemId };
//     } catch (error) {
//       throw new Error(`Failed to sync update for item ${itemId}`);
//     }
//   }
// }
