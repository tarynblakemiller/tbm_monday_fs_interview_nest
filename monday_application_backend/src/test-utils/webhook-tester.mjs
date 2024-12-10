// src/test-utils/webhook-tester.mjs

import { createHmac, randomBytes } from 'node:crypto';

class WebhookTester {
  constructor(
    baseUrl = 'http://localhost:8080',
    endpoint = '/api/webhooks/monday',
    secret = process.env.MONDAY_WEBHOOK_SECRET || 'test-webhook-secret',
  ) {
    this.webhookUrl = `${baseUrl}${endpoint}`;
    this.webhookSecret = secret;
    console.log('Webhook URL:', this.webhookUrl);
  }

  generateSignature(payload) {
    const hmac = createHmac('sha256', this.webhookSecret);
    return hmac.update(JSON.stringify(payload)).digest('base64');
  }

  createBaseEvent() {
    return {
      userId: 9603417,
      originalTriggerUuid: null,
      boardId: 456,
      pulseId: 123,
      app: 'monday',
      triggerTime: new Date().toISOString(),
      subscriptionId: 73759690,
      triggerUuid: randomBytes(16).toString('hex'),
    };
  }

  async sendWebhook(payload) {
    const signature = this.generateSignature(payload);
    console.log('Sending payload:', JSON.stringify(payload, null, 2));
    console.log('Generated signature:', signature);

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-monday-signature': signature,
        },
        body: JSON.stringify(payload),
      });

      return response;
    } catch (error) {
      console.error('Error sending webhook:', error);
      throw error;
    }
  }

  async testCreatePulse(name = 'Test Item') {
    console.log('Testing create pulse with name:', name);
    const payload = {
      event: {
        ...this.createBaseEvent(),
        type: 'create_pulse',
        pulseName: name,
        groupId: 'topics',
      },
    };
    return this.sendWebhook(payload);
  }

  async testUpdateColumn(columnId, columnType, value) {
    console.log('Testing update column:', { columnId, columnType, value });
    const payload = {
      event: {
        ...this.createBaseEvent(),
        type: 'update_column_value',
        columnId,
        columnType,
        value,
      },
    };
    return this.sendWebhook(payload);
  }

  async testDeletePulse() {
    console.log('Testing delete pulse');
    const payload = {
      event: {
        ...this.createBaseEvent(),
        type: 'delete_pulse',
      },
    };
    return this.sendWebhook(payload);
  }

  async testCreateUpdate(updateText) {
    console.log('Testing create update:', updateText);
    const payload = {
      event: {
        ...this.createBaseEvent(),
        type: 'create_update',
        body: updateText,
        textBody: updateText,
      },
    };
    return this.sendWebhook(payload);
  }

  async testChallenge() {
    console.log('Testing challenge request');
    const payload = {
      challenge: 'test-challenge',
      challengeType: 'webhook_challenge',
      type: 'challenge',
    };
    return this.sendWebhook(payload);
  }
}

// Main execution
const args = process.argv.slice(2);
const command = args[0];

console.log('Running command:', command);
console.log('Arguments:', args.slice(1));

const tester = new WebhookTester();

try {
  let response;

  switch (command) {
    case 'create':
      response = await tester.testCreatePulse(args[1]);
      break;
    case 'update':
      response = await tester.testUpdateColumn(args[1], args[2], args[3]);
      break;
    case 'delete':
      response = await tester.testDeletePulse();
      break;
    case 'comment':
      response = await tester.testCreateUpdate(args[1]);
      break;
    case 'challenge':
      response = await tester.testChallenge();
      break;
    default:
      console.log(
        'Available commands: create, update, delete, comment, challenge',
      );
      process.exit(1);
  }

  console.log('Response status:', response.status);
  const result = await response.json();
  console.log('Response body:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error running test:', error);
  process.exit(1);
}
