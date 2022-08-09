import { useState } from 'react';
import '@picocss/pico/css/pico.min.css';
import { Profile } from './lib/types';
import { getProfiles, getEvents } from './lib/api';
import { format } from 'date-fns';
import { SearchParameters, EventResponse } from './lib/api.types';
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

  if (profiles.length === 0) {
    getProfiles().then((result) => {
      setProfiles(result);
    });
  }

  const executeSearch = async (params: Partial<SearchParameters> = {}) => {
    setIsSearching(true);
    setEvents([]);
    const { events } = await getEvents({
      profileId: selectedProfile || '',
      search,
      status: statusValues !== StatusValues.both ? statusValues : undefined,
      ...params,
    });
    setEvents(events);
    setIsSearching(false);
  };

  const onChangeSelectedProfile = async (event) => {
    if (event.currentTarget.value === selectedProfile) {
      return;
    }
    setSelectedProfile(event.currentTarget.value);
    await executeSearch({
      profileId: event.currentTarget.value,
      search: search,
    });
  };

  const onClickStatusValue = async (event) => {
    setStatusValues(event.currentTarget.value);
  };

  const onChangeSearch = async (event) => {
    setSearch(event.currentTarget.value);
  };

  const onClickSearch = async () => {
    await executeSearch();
  };

  return (
    <div>
      <form>
        <div className="container">
          <select id="profile" value={ selectedProfile || '' } disabled={ isSearching } onChange={ onChangeSelectedProfile }>
            { !selectedProfile && (
              <option value="">Select a profile</option>
            )}
            {profiles.map((profile) => (
              <option key={ profile.profileId } value={ profile.profileId }>{ profile.name }</option>
            ))}
          </select>
        </div>

        <fieldset>
          <legend>Status</legend>
          <label htmlFor="default">
            <input type="radio" id="default" name="size" value="default" disabled={ isSearching } checked={ statusValues === StatusValues.default } onClick={ onClickStatusValue } />
            Unblocked
          </label>
          <label htmlFor="blocked">
            <input type="radio" id="blocked" name="size" value="blocked" disabled={ isSearching } checked={ statusValues === StatusValues.blocked } onClick={ onClickStatusValue } />
            Blocked
          </label>
          <label htmlFor="both">
            <input type="radio" id="both" name="size" value="both" disabled={ isSearching } checked={ statusValues === StatusValues.both } onClick={ onClickStatusValue } />
            Both
          </label>
        </fieldset>

        <input value={ search } disabled={ isSearching } onChange={ onChangeSearch } />

        <button role="button" disabled={ isSearching } onClick={ onClickSearch }>Search</button>
      </form>
      { isSearching && (
        <Watch
          height="80"
          width="80"
          radius="48"
          color="#4fa94d"
          ariaLabel="watch-loading"
          wrapperStyle={{}}
          wrapperClassName=""
          visible={true}
        />
      ) }
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
        </div>
      ) : (
        <div>No events found.</div>
      ) }
      <div>
        <pre>{ selectedProfile }</pre>
        <pre>{ search }</pre>
        <pre>{ JSON.stringify(events, null, 2) }</pre>
      </div>
    </div>
  );
}

export default App;
