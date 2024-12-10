import { Test, TestingModule } from '@nestjs/testing';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { MockMondayService } from '../__mocks__/mock-monday.service';
import { MondayService } from '../monday.service';
import { MondayWebhookController } from '../../webhook-handler/monday-webhook.controller';

export const createTestModule = async () => {
  const module: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [
          () => ({
            monday: {
              apiUrl: 'http://mock-monday-api.local',
              apiToken: 'mock-token',
              boardId: 'mock-board-id',
            },
          }),
        ],
      }),
      CacheModule.register({
        isGlobal: true,
        ttl: 5,
      }),
    ],
    controllers: [MondayWebhookController],
    providers: [
      {
        provide: MondayService,
        useClass: MockMondayService,
      },
    ],
  }).compile();

  return module;
};
