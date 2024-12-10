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
  challenge: string;
  challengeType?: string;
  type?: 'challenge';
}

export interface MondayWebhookEvent {
  type:
    | 'create_pulse'
    | 'update_column_value'
    | 'delete_pulse'
    | 'create_update';
  userId: number;
  originalTriggerUuid: string | null;
  boardId: number;
  pulseId: number;
  pulseName?: string;
  groupId?: string;
  columnId?: string;
  columnValues?: Record<string, any>; // If needed
  body?: string; // For create_update events
  textBody?: string;
  columnType?: MondayColumnType;
  value?: {
    label?:
      | string
      | {
          index: number;
          text: string;
          style: {
            color: string;
            border: string;
            var_name: string;
          };
        };
    value?: string | number | boolean | string[];
    text?: string;
    date?: string;
    time?: string | null;
  };
  app: 'monday';
  triggerTime: string;
  subscriptionId: number;
  triggerUuid: string;
}

export type MondayWebhookPayload =
  | MondayWebhookChallenge
  | {
      event: MondayWebhookEvent;
    };

export interface MondayWebhookResponse {
  challenge?: string;
  success?: boolean;
  message?: string;
}
