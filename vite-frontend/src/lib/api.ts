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

export const getEvents = async (
  parameters: SearchParameters,
): Promise<SearchResponse> => {
  // @TODO add pagination
  const url = `${baseUrl}/events?${new URLSearchParams(
    parameters as unknown as { [key: string]: string },
  ).toString()}`;
  const result = await fetch(url);
  const data = await result.json();
  return data;
};
