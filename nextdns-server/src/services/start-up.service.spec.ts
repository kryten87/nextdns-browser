import { Test, TestingModule } from '@nestjs/testing';
import { StartUpService } from './start-up.service';

describe('StartUpService', () => {
  let service: StartUpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StartUpService],
    }).compile();

    service = module.get<StartUpService>(StartUpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
