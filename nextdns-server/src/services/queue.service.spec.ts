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
});
