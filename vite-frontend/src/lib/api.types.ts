export type EventId = number;
export type ProfileId = string;
export type DeviceId = string;

export enum EventStatus {
  default = 'default',
  blocked = 'blocked',
}

export interface SearchParameters {
  profileId: string;
  deviceId?: string;
  status?: string;
  search?: string;
}

export interface EventResponse {
  eventId: EventId;
  hash: string;
  profileId: ProfileId;
  timestamp: number;
  domain: string;
  root: string;
  tracker: string;
  encrypted: boolean;
  protocol: string;
  clientIp: string;
  client: string;
  deviceId: DeviceId;
  status: EventStatus;
  reasons: string;
  name: string;
  model: string;
  localIp: string;
}

export interface SearchResponse {
  cursor: number;
  events: EventResponse[];
}
