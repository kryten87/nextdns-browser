import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config';

describe('DatabaseService', () => {
  let service: DatabaseService;

  const mockConfigService = {
    get: (key: string): string => {
      if (key === 'DATABASE_CLIENT') {
        return 'sqlite3';
      } else if (key === 'SQLITE_FILE') {
        return ':memory:';
      }
      throw new Error(`unexpected config key "${key}"`);
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertProfile', () => {
    it.todo('should correctly insert a profile');
  });

  describe('insertDevice', () => {
    it.todo('should correctly insert a device');
  });

  describe('insertEvent', () => {
    it.todo('should correctly insert an event');
  });

  describe('getDevices', () => {
    it.todo('should get the expected results');
  });

});
