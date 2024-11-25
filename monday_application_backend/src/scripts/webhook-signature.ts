import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

const secret = process.env.MONDAY_WEBHOOK_SECRET;

if (!secret) {
  throw new Error(
    'MONDAY_WEBHOOK_SECRET is not defined in environment variables',
  );
}

const payload = JSON.stringify({
  event: {
    type: 'change_column_value',
    boardId: '123456789',
    itemId: '987654321',
    columnId: 'status',
    columnType: 'status',
    value: {
      label: 'Done',
    },
  },
});

const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

console.log(signature);
