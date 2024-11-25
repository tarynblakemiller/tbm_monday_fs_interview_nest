export interface MondayColumnValue {
  id: string;
  text: string;
  type: string;
  value: string | null;
}

export interface MondayWebhookEvent {
  type: 'change_column_value' | 'create_item' | 'create_update';
  triggerTime: string;
  subscriptionId: number;
  userId: number;
  originalTriggerUuid: string;
  boardId: number;
  groupId: string;
  itemId: number;
  pulseId: number;
  columnId: string;
  columnType: string; // Added this
  columnTitle: string;
  value: {
    label?: string;
    index?: number;
    post_id?: string;
    value?: string | number;
    text?: string;
  };
  previousValue: {
    label?: string;
    index?: number;
    post_id?: string;
    value?: string | number;
    text?: string;
  };
}
