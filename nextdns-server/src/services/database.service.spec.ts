import { ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';
import { MigrationSource } from '../libs/migration-source';
import { Test, TestingModule } from '@nestjs/testing';

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
    await service.connection.migrate.latest({
      migrationSource: new MigrationSource(),
    });
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('insertProfile', () => {
    it('should correctly insert a profile', async () => {
      const profile = {
        id: 'abcdef',
        fingerprint: 'fp6872abcdefabcdef',
        name: 'My Profile',
      };
      const id = await service.insertProfile(profile);
      expect(id).toBe(profile.id);

      // query the database for that ID & check the results
      const row = await service
        .connection('profiles')
        .where('id', '=', id)
        .first();
      expect(row).toEqual(profile);
    });
  });

  describe('insertDevice', () => {
    it('should correctly insert a device', async () => {
      const device = {
        id: 'VWXYZ',
        name: 'myhost',
        model: 'Acme Inc.',
        localIp: '192.168.1.1',
      };
      const id = await service.insertDevice(device);
      expect(id).toBe(device.id);

      // query the database for that ID & check the results
      const row = await service
        .connection('devices')
        .where('id', '=', id)
        .first();
      expect(row).toEqual(device);
    });
  });

  describe('insertEvent', () => {
    describe('existing device', () => {
      const device = {
        id: 'XXXX1',
        name: 'host01',
        model: 'Dell Inc.',
        localIp: '192.168.1.1',
      };

      beforeEach(async () => {
        await service.insertDevice(device);
      });

      it('should correctly insert an event', async () => {
        const event = {
          timestamp: '2022-06-26T05:17:42.192Z',
          domain: 'vortex.data.microsoft.com',
          root: 'microsoft.com',
          tracker: 'microsoft',
          encrypted: true,
          protocol: 'DNS-over-HTTPS',
          clientIp: '172.251.100.100',
          client: 'nextdns-cli',
          device,
          status: 'default',
          reasons: [],
        };
        const id = await service.insertEvent(event);
        expect(id).not.toBe('');

        // query the database for that ID & check the results
        const row = await service
          .connection('events')
          .where('id', '=', id)
          .first();
        expect(row).toEqual({
          id,
          timestamp: new Date(event.timestamp).valueOf() / 1000,
          domain: event.domain,
          root: event.root,
          tracker: event.tracker,
          encrypted: event.encrypted ? 1 : 0,
          protocol: event.protocol,
          clientIp: event.clientIp,
          client: event.client,
          deviceId: event.device.id,
          status: event.status,
          reasons: (event.reasons || []).join(', '),
        });
      });
    });

    describe('non-existent device', () => {
      it('should correctly insert an event and device', async () => {
        const event = {
          timestamp: '2022-06-26T05:17:42.192Z',
          domain: 'vortex.data.microsoft.com',
          root: 'microsoft.com',
          tracker: 'microsoft',
          encrypted: true,
          protocol: 'DNS-over-HTTPS',
          clientIp: '172.251.100.100',
          client: 'nextdns-cli',
          device: {
            id: 'XXXX1',
            name: 'something',
            model: 'Dell Inc.',
            localIp: '192.168.1.1',
          },
          status: 'default',
          reasons: [],
        };
        const id = await service.insertEvent(event);
        expect(id).not.toBe('');

        // query the database for that event ID & check the results
        const newEvent = await service
          .connection('events')
          .where('id', '=', id)
          .first();
        expect(newEvent).toEqual({
          id,
          timestamp: new Date(event.timestamp).valueOf() / 1000,
          domain: event.domain,
          root: event.root,
          tracker: event.tracker,
          encrypted: event.encrypted ? 1 : 0,
          protocol: event.protocol,
          clientIp: event.clientIp,
          client: event.client,
          deviceId: event.device.id,
          status: event.status,
          reasons: (event.reasons || []).join(', '),
        });

        // query the database for that device ID & check the results
        const newDevice = await service
          .connection('devices')
          .where('id', '=', event.device.id)
          .first();
        expect(newDevice).toEqual(event.device);
      });
    });
  });

  describe('getDevices', () => {
    const devices = [
      {
        id: 'XXXX1',
        name: 'host01',
        model: 'Dell Inc.',
        localIp: '192.168.1.1',
      },
      {
        id: 'XXXX2',
        name: 'host02',
        model: 'Dell Inc.',
        localIp: '192.168.1.2',
      },
      {
        id: 'XXXX3',
        name: 'host03',
        model: 'Dell Inc.',
        localIp: '192.168.1.3',
      },
      {
        id: 'XXXX4',
        name: 'host04',
        model: 'Dell Inc.',
        localIp: '192.168.1.4',
      },
    ];

    beforeEach(async () => {
      await Promise.all(devices.map((device) => service.insertDevice(device)));
    });

    it('should get the expected results', async () => {
      const result = await service.getDevices();
      expect(result).toEqual(devices);
    });
  });

  describe('getProfiles', () => {
    const profiles = [
      { id: 'abcd01', fingerprint: 'fp6872abcdefabcd01', name: 'Profile 01' },
      { id: 'abcd02', fingerprint: 'fp6872abcdefabcd02', name: 'Profile 02' },
      { id: 'abcd03', fingerprint: 'fp6872abcdefabcd03', name: 'Profile 03' },
      { id: 'abcd04', fingerprint: 'fp6872abcdefabcd04', name: 'Profile 04' },
    ];

    beforeEach(async () => {
      await Promise.all(
        profiles.map((profile) => service.insertProfile(profile)),
      );
    });

    it('should get the expected results', async () => {
      const result = await service.getProfiles();
      expect(result).toEqual(profiles);
    });
  });
});
