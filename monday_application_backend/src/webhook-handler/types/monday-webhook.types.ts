export type MondayColumnType =
  | 'text'
  | 'numeric'
  | 'status'
  | 'dropdown'
  | 'date'
  | 'color'
  | 'boolean'
  | 'multiple-person'
  | 'long-text';

export interface MondayWebhookChallenge {
  challengeId: string;
  challengeType: string;
  type: 'challenge';
}

export interface MondayWebhookEvent {
  type:
    | 'create_item'
    | 'change_column_value'
    | 'change_status'
    | 'delete_item'
    | 'create_update';
  boardId: number;
  itemId: number;
  pulseId?: number;
  columnId?: string;
  columnType?: MondayColumnType;
  value?: {
    label?: string;
    value?: string | number | boolean | string[];
    text?: string;
  };
}

export interface MondayWebhookPayload {
  event: MondayWebhookEvent;
  challengeId?: string;
  challengeType?: string;
}
