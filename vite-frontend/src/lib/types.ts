export interface ReportParameters {
  profileId: string;
}

export type PartialReportParameters = Partial<ReportParameters>;

export interface Profile {
  profileId: string;
  fingerprint?: string;
  name: string;
}

export interface Event {
  timestamp: string;
  domain: string;
  root: string;
  tracker: string;
  encrypted: boolean;
  protocol: string;
  clientIp: string;
  client: string;
  device: {
    id: string;
    name: string;
    model: string;
    localIp: string;
  };
  status: string;
  reasons: string[];
}

export interface ResultMetadata {
  pagination: {
    cursor: string;
  };
  stream: {
    id: string;
  };
}

export interface LogResults {
  data: Event[];
  meta: ResultMetadata;
}
