import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './services/queue.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './services/database.service';
import { NextDnsApiService } from './services/next-dns-api.service';

describe('AppController', () => {
  let appController: AppController;

  const mockQueueService = {
    onLogQueueMessage: jest.fn(),
  };

  const mockDbService = {};

  const mockApiService = {};

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        ConfigService,
        { provide: QueueService, useValue: mockQueueService },
        { provide: DatabaseService, useValue: mockDbService },
        { provide: NextDnsApiService, useValue: mockApiService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('onModuleInit', () => {
    it.todo('should load the list of profiles from the database');

    it.todo('should initialze an event source for each profile');
  });

  describe('createStreamHandler', () => {
    it.todo('should return a handler function');

    it.todo('should send a message to the queue when the handler is called');
  });

  describe('queueHandler', () => {
    it.todo('should insert an event into the database');

    it.todo('should not update the last event ID if none is present');

    it.todo('should update the last event ID if it exists');
  });
});
