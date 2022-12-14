import { useState } from 'react';
import '@picocss/pico/css/pico.min.css';
import { Profile } from './lib/types';
import { getProfiles, getEvents } from './lib/api';
import { format } from 'date-fns';
import { SearchParameters, EventResponse, SearchResponse } from './lib/api.types';
import { Watch } from 'react-loader-spinner';

enum StatusValues {
  default = 'default',
  blocked = 'blocked',
  both = 'both',
};

function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null as string | null);
  const [profiles, setProfiles] = useState([] as Profile[]);
  const [statusValues, setStatusValues] = useState(StatusValues.both);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([] as EventResponse[]);
  const [cursor, setCursor] = useState(null as number | null);

  if (profiles.length === 0) {
    getProfiles().then((result) => {
      setProfiles(result);
    });
  }

  const executeSearch = async (params: Partial<SearchParameters> = {}, cursorValue: number | null = null) => {
    setIsSearching(true);
    if (!cursorValue) {
      setEvents([]);
    }
    const results = await getEvents({
      profileId: selectedProfile || '',
      search,
      status: statusValues !== StatusValues.both ? statusValues : undefined,
      ...params,
    }, cursorValue);
    if (!cursorValue) {
      setEvents(results.events);
    } else {
      setEvents([...events, ...results.events]);
    }
    setCursor(results.cursor);
    setIsSearching(false);
  };

  const onChangeSelectedProfile = async (event: any): Promise<void> => {
    if (event.currentTarget.value === selectedProfile) {
      return;
    }
    setSelectedProfile(event.currentTarget.value);
    await executeSearch({
      profileId: event.currentTarget.value,
      search: search,
    });
  };

  const onClickStatusValue = async (event: any): Promise<void> => {
    setStatusValues(event.currentTarget.value);
  };

  const onChangeSearch = async (event: any): Promise<void> => {
    setSearch(event.currentTarget.value);
  };

  const onClickSearch = async () => {
    await executeSearch();
  };

  const onClickMore = async () => {
    await executeSearch({}, cursor);
  };

  return (
    <div>
      <form>
        <div>
          <select id="profile" value={ selectedProfile || '' } disabled={ isSearching } onChange={ onChangeSelectedProfile }>
            { !selectedProfile && (
              <option value="">Select a profile</option>
            )}
            {profiles.map((profile) => (
              <option key={ profile.profileId } value={ profile.profileId }>{ profile.name }</option>
            ))}
          </select>
        </div>

        <fieldset className="grid">
          <div>
            <legend>Status</legend>
          </div>
          <div>
            <label htmlFor="default">
              <input type="radio" id="default" name="size" value="default" disabled={ isSearching } checked={ statusValues === StatusValues.default } onClick={ onClickStatusValue } />
              Unblocked
            </label>
          </div>
          <div>
            <label htmlFor="blocked">
              <input type="radio" id="blocked" name="size" value="blocked" disabled={ isSearching } checked={ statusValues === StatusValues.blocked } onClick={ onClickStatusValue } />
              Blocked
            </label>
          </div>
          <div>
            <label htmlFor="both">
              <input type="radio" id="both" name="size" value="both" disabled={ isSearching } checked={ statusValues === StatusValues.both } onClick={ onClickStatusValue } />
              Both
            </label>
          </div>
        </fieldset>

        <input value={ search } disabled={ isSearching } placeholder="Enter search text here" onChange={ onChangeSearch } />

        <button role="button" disabled={ isSearching } onClick={ onClickSearch }>Search</button>
      </form>
      { events.length ? (
        <div>
          <table role="grid">
            <thead>
              <tr>
                <th>Time</th>
                <th>Domain</th>
                <th>Device</th>
                <th>Status</th>
                <th>Reasons</th>
              </tr>
            </thead>
            <tbody>
              { events.map((event) => (
                <tr key={ event.hash } >
                  <td>{ format(new Date(event.timestamp * 1000), 'MMM d, yyyy h:mm:ss a') }</td>
                  <td>{ event.domain }</td>
                  <td>{ event.name || event.localIp }</td>
                  <td>{ event.status }</td>
                  <td>{ event.reasons }</td>
                </tr>
              )) }
            </tbody>
          </table>

          <button role="button" disabled = { isSearching } onClick={ onClickMore }>More</button>
        </div>
      ) : (
        isSearching ? null : <div>No events found.</div>
      ) }
      { isSearching && (
        <Watch
          height="80"
          width="80"
          radius="48"
          color="#4fa94d"
          ariaLabel="watch-loading"
          wrapperStyle={{}}
          visible={true}
        />
      ) }
    </div>
  );
}

export default App;
