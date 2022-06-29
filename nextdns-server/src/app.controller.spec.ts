import { AppController } from './app.controller';
// import { ConfigService } from '@nestjs/config';
// import { QueueService } from './services/queue.service';
// import { Test, TestingModule } from '@nestjs/testing';

describe('AppController', () => {
  let appController: AppController;

  // const mockQueueService = {
  //   onLogQueueMessage: jest.fn(),
  // };

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
