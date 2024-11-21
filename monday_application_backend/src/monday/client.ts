import { createClient, Client, fetchExchange } from '@urql/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MondayClient {
  private client: Client;

  constructor(private configService: ConfigService) {
    const token = this.configService.get('monday.apiToken');
    console.log('Token value:', !!token);

    this.client = createClient({
      url:
        this.configService.get('monday.apiUrl') || 'https://api.monday.com/v2',
      exchanges: [fetchExchange],
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    });
  }

  getClient(): Client {
    return this.client;
  }
}
