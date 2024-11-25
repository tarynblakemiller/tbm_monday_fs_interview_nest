export interface MondayWebhookEvent {
  type: string;
  boardId: string;
  itemId: number;
  columnId: string;
  columnType: string;
  value: {
    label: string;
    index: number;
  };
}

export interface MondayWebhookPayload {
  event: MondayWebhookEvent;
}
