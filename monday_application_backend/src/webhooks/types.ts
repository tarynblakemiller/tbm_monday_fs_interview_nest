export interface MondayColumnValue {
  status?: string;
  text?: string;
  value: any;
}

export interface MondayWebhookPayload {
  event: {
    type: 'item_created' | 'item_updated' | 'status_changed';
    boardId: number;
    itemId: number;
    pulseId: number;
    userId: number;
    originalValue: MondayColumnValue | null;
    value: MondayColumnValue;
    timestamp: string;
  };
  challengeId?: string;
  challenge?: string;
}
