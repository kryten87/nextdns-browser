import { Profile, ReportParameters, LogResults } from './types';

const baseUrl = 'http://localhost:3000/api';

const pause = (duration: number) => new Promise((resolve) => setTimeout(resolve, duration));

export const getProfiles = async (): Promise<Profile[]> => {
  // @TODO add pagination
  const url = `${baseUrl}/profiles`;
  const result = await fetch(url);
  const body = await result.json();
  return body.data;
};
