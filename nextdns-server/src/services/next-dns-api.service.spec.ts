import { ConfigService } from '@nestjs/config';
import { NextDnsApiService } from './next-dns-api.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('NextDnsApiService', () => {
  let service: NextDnsApiService;

  const apiKey = 'abcd1234';
  const baseUrl = 'http://example.com/';

  const mockAxios = jest.fn();

  const mockConfigService = {
    get: (key: string): string => {
      if (key === 'NEXTDNS_API_KEY') {
        return apiKey;
      } else if (key === 'NEXTDNS_BASE_URL') {
        return baseUrl;
      }
      throw new Error(`unexpected config key "${key}"`);
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NextDnsApiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: 'AXIOS_LIB', useValue: mockAxios },
      ],
    }).compile();

    service = module.get<NextDnsApiService>(NextDnsApiService);

    mockAxios.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfiles', () => {
    describe('only one page of values', () => {
      const profiles = [
        {
          id: '920001',
          fingerprint: 'fp6872000000000001',
          name: 'Profile 01',
        },
        {
          id: '960002',
          fingerprint: 'fpe9a1000000000002',
          name: 'Profile 02',
        },
      ];

      beforeEach(() => {
        mockAxios.mockResolvedValue({ data: { data: profiles } });
      });

      it('should return the expected values', async () => {
        const result = await service.getProfiles();

        expect(mockAxios).toBeCalledTimes(1);
        expect(mockAxios.mock.calls[0]).toEqual([
          {
            method: 'GET',
            url: `${baseUrl}/profiles`,
            headers: { 'X-Api-Key': apiKey },
          },
        ]);
        expect(result).toEqual(profiles);
      });
    });

    describe('multiple pages of values', () => {
      const profiles = [
        [
          {
            id: '920001',
            fingerprint: 'fp6872000000000001',
            name: 'Profile 01',
          },
          {
            id: '960002',
            fingerprint: 'fpe9a1000000000002',
            name: 'Profile 02',
          },
        ],
        [
          {
            id: '920003',
            fingerprint: 'fp6872000000000003',
            name: 'Profile 03',
          },
          {
            id: '960004',
            fingerprint: 'fpe9a1000000000004',
            name: 'Profile 04',
          },
        ],
        [
          {
            id: '920005',
            fingerprint: 'fp6872000000000005',
            name: 'Profile 05',
          },
          {
            id: '960006',
            fingerprint: 'fpe9a1000000000006',
            name: 'Profile 06',
          },
        ],
      ];
      const allProfiles = profiles.reduce((prev, curr) => {
        return [...prev, ...curr];
      }, []);

      beforeEach(() => {
        profiles.forEach((page, idx) => {
          const expected = {
            data: page,
            ...(idx !== 2 && {
              meta: { pagination: { cursor: `cursor${idx}` } },
            }),
          };
          mockAxios.mockResolvedValueOnce({ data: expected });
        });
      });

      it('should return the expected values', async () => {
        const result = await service.getProfiles();
        const method = 'GET';
        const headers = { 'X-Api-Key': apiKey };

        expect(mockAxios).toBeCalledTimes(3);
        expect(mockAxios.mock.calls).toEqual([
          [{ method, url: `${baseUrl}/profiles`, headers }],
          [{ method, url: `${baseUrl}/profiles?cursor=cursor0`, headers }],
          [{ method, url: `${baseUrl}/profiles?cursor=cursor1`, headers }],
        ]);

        expect(result).toEqual(allProfiles);
      });
    });
  });
});
