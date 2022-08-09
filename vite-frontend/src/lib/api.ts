import { SearchParameters, SearchResponse } from './api.types';

// @TODO clean up types
import { Profile, Event, ReportParameters, LogResults } from './types';

const baseUrl = 'http://localhost:3000/api';

const pause = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

export const getProfiles = async (): Promise<Profile[]> => {
  // @TODO add pagination
  const url = `${baseUrl}/profiles`;
  const result = await fetch(url);
  return result.json();
};

const stripUndefinedProperties = (obj: { [key: string]: string | number | undefined | null }): { [key: string]: string } => {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (!result[key] && result[key] !== 0) {
      delete result[key];
    }
  });
  return result as { [key: string]: string };
};

export const getEvents = async (
  parameters: SearchParameters,
): Promise<SearchResponse> => {
  // @TODO add pagination
  const params: { [key: string]: string } = stripUndefinedProperties({ ...parameters });
  const url = `${baseUrl}/events?${new URLSearchParams(params).toString()}`;
  const result = await fetch(url);
  const data = await result.json();
  return data;
};
