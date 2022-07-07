import { ConfigService } from '@nestjs/config';
import { QueueService } from './queue.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConfigService, QueueService],
    }).compile();

    service = module.get<QueueService>(QueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it.todo('should connect to the messaging service');

    it.todo('should create a channel');

    it.todo('should check to ensure the queue is set up');
  });

  describe('onModuleDestroy', () => {
    it.todo('should close the connection');
  });

  describe('sendToLogQueue', () => {
    it.todo('should send to message to the correct queue');
  });

  describe('onLogQueueMessage', () => {
    it.todo('should consume the message');

    it.todo('should call the callback function');

    it.todo('should acknowledge the message');
  });
});
