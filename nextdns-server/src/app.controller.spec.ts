import { AppController } from './app.controller';
import { ConfigService } from '@nestjs/config';
import { QueueService } from './services/queue.service';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './services/database.service';
import { NextDnsApiService } from './services/next-dns-api.service';

describe('AppController', () => {
  let appController: AppController;

  const profiles = [
    {
      id: '92abcd',
      fingerprint: 'fp6872abcdabcdabcd',
      name: 'Profile 1',
      role: null,
      lastEventId: '64v3adtj68tk6chm6gabcdabcd',
    },
    {
      id: '96abcd',
      fingerprint: 'fpe9a1abcdabcdabcd',
      name: 'Profile 2',
      role: null,
      lastEventId: '64v3adtj68tk6c9k6cabcdabcd',
    },
  ];

  const mockDbService = {
    getProfiles: jest.fn().mockResolvedValue(profiles),
  };

  const mockApiService = {
    initializeEventSource: jest.fn(),
  };

  const mockQueueService = {
    onLogQueueMessage: jest.fn(),
    sendToLogQueue: jest.fn(),
  };

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

    mockDbService.getProfiles.mockClear();
    mockApiService.initializeEventSource.mockClear();
    mockQueueService.onLogQueueMessage.mockClear();
    mockQueueService.sendToLogQueue.mockClear();
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should load the list of profiles from the database', async () => {
      await appController.onModuleInit();

      expect(mockDbService.getProfiles.mock.calls.length).toBe(1);
    });

    it('should initialze an event source for each profile', async () => {
      await appController.onModuleInit();

      expect(mockApiService.initializeEventSource.mock.calls.length).toBe(2);
      expect(mockApiService.initializeEventSource.mock.calls[0][0]).toEqual(
        profiles[0],
      );
      expect(mockApiService.initializeEventSource.mock.calls[1][0]).toEqual(
        profiles[1],
      );
    });
  });

  describe('createStreamHandler', () => {
    it('should return a handler function', () => {
      const handler = appController.createStreamHandler(profiles[0].id);
      expect(typeof handler).toBe('function');
    });

    it('should send a message to the queue when the handler is called', async () => {
      const message = 'this is a message';
      const handler = appController.createStreamHandler(profiles[0].id);
      await handler(message);
      expect(mockQueueService.sendToLogQueue.mock.calls.length).toBe(1);
      expect(mockQueueService.sendToLogQueue.mock.calls[0]).toEqual([
        profiles[0].id,
        message,
      ]);
    });
  });

  describe('queueHandler', () => {
    it.todo('should insert an event into the database');

    it.todo('should not update the last event ID if none is present');

    it.todo('should update the last event ID if it exists');
  });
});
