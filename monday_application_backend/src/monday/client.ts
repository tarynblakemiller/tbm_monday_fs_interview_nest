import { createClient, Client, fetchExchange } from '@urql/core';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

@Injectable()
export class MondayClient {
  private client: Client;
  private readonly logger = new Logger(MondayClient.name);

  constructor(
    private configService: ConfigService,
    // @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    const token = this.validateAndMaskToken();
    this.initializeClient(token);
  }

  private validateAndMaskToken(): string {
    const token = this.configService.getOrThrow('monday.apiToken');
    if (!token || token.length < 32) {
      throw new Error('Invalid Monday.com API token format');
    }

    const maskedToken = `${token.slice(0, 4)}...${token.slice(-4)}`;
    this.logger.log(`Initializing Monday client with token: ${maskedToken}`);

    return token;
  }

  private initializeClient(token: string) {
    this.client = createClient({
      url:
        this.configService.get('monday.apiUrl') ?? 'https://api.monday.com/v2',
      exchanges: [fetchExchange],
      //prevents stale token issues
      fetchOptions: () => ({
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }),
    });
  }

  getClient(): Client {
    return this.client;
  }
}
