import { Test, TestingModule } from '@nestjs/testing';
import { NextDnsApiService } from './next-dns-api.service';

describe('NextDnsApiService', () => {
  let service: NextDnsApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NextDnsApiService],
    }).compile();

    service = module.get<NextDnsApiService>(NextDnsApiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
