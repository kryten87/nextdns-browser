import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { QueueService } from './services/queue.service';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let appController: AppController;

  const mockQueueService = {
    onLogQueueMessage: jest.fn(),
  };

  beforeEach(async () => {
    /*
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        ConfigService,
        { provide: QueueService, useValue: mockQueueService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    */
  });

  it.skip('should be defined', () => {
    expect(appController).toBeDefined();
  });
});
