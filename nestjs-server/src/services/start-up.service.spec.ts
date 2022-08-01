import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { NextDnsApiService } from './next-dns-api.service';
import { StartUpService } from './start-up.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('StartUpService', () => {
  let service: StartUpService;

  const profiles = ['profile 1', 'profile 2', 'profile 3'];

  const mockApi = {
    getProfiles: jest.fn().mockResolvedValue(profiles),
  };
  const mockDb = {
    insertProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StartUpService,
        ConfigService,
        { provide: DatabaseService, useValue: mockDb },
        { provide: NextDnsApiService, useValue: mockApi },
      ],
    }).compile();

    service = module.get<StartUpService>(StartUpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateProfiles', () => {
    it('should get the profiles from the API and save them in the database', async () => {
      await service.updateProfiles();
      expect(mockApi.getProfiles.mock.calls.length).toBe(1);
      expect(mockDb.insertProfile.mock.calls.length).toBe(profiles.length);
      expect(mockDb.insertProfile.mock.calls).toEqual(
        profiles.map((profile) => [profile]),
      );
    });
  });
});
