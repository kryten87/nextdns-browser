import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('QueueService', () => {
  let service: QueueService;

  const mockChannel = {
    assertQueue: jest.fn().mockResolvedValue(true),
    sendToQueue: jest.fn(),
    ack: jest.fn(),
    consume: jest.fn(),
  };

  const mockConnection = {
    createChannel: jest.fn().mockResolvedValue(mockChannel),
    close: jest.fn(),
  };

  const mockAmqp = {
    connect: jest.fn().mockResolvedValue(mockConnection),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        QueueService,
        { provide: 'AMQP_LIB', useValue: mockAmqp },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);

    mockAmqp.connect.mockClear();
    mockConnection.createChannel.mockClear();
    mockChannel.assertQueue.mockClear();
    mockChannel.sendToQueue.mockClear();
    mockChannel.ack.mockClear();
    mockChannel.consume.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should connect to the messaging service', async () => {
      await service.onModuleInit();
      expect(mockAmqp.connect.mock.calls.length).toBe(1);
    });

    it('should create a channel', async () => {
      await service.onModuleInit();
      expect(mockConnection.createChannel.mock.calls.length).toBe(1);
    });

    it('should check to ensure the queue is set up', async () => {
      await service.onModuleInit();
      expect(mockChannel.assertQueue.mock.calls.length).toBe(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should close the connection', async () => {
      await service.onModuleInit();
      await service.onModuleDestroy();
      expect(mockConnection.close.mock.calls.length).toBe(1);
    });
  });

  describe('sendToLogQueue', () => {
    const profileId = `id-${Date.now()}`;
    const message = {
      data: JSON.stringify({ value: `some message data ${Date.now}` }),
    };

    it('should send to message to the correct queue', async () => {
      await service.onModuleInit();
      service.sendToLogQueue(profileId, message);
      expect(mockChannel.sendToQueue.mock.calls.length).toBe(1);
    });
  });

  describe('onLogQueueMessage', () => {
    let message;

    beforeEach(() => {
      message = {
        data: JSON.stringify({ value: `some message data ${Date.now}` }),
      };
    });

    it('should consume the message', async () => {
      await service.onModuleInit();
      await service.onLogQueueMessage(message);
      expect(mockChannel.consume.mock.calls.length).toBe(1);
    });
  });
});
