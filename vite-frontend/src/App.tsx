import { useState } from 'react';
import '@picocss/pico/css/pico.min.css';
import { Profile } from './lib/types';
import { getProfiles, getEvents } from './lib/api';
import { format } from 'date-fns';
import { SearchParameters, EventResponse } from './lib/api.types';

function App() {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null as string | null);
  const [profiles, setProfiles] = useState([] as Profile[]);
  const [search, setSearch] = useState("");
  const [events, setEvents] = useState([] as EventResponse[]);

  if (profiles.length === 0) {
    getProfiles().then((result) => {
      setProfiles(result);
    });
  }

  const executeSearch = async (params: SearchParameters) => {
    setIsSearching(true);
    setEvents([]);
    const { events } = await getEvents(params);
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

  const onChangeSearch = async (event) => {
    setSearch(event.currentTarget.value);
  };

  const onClickSearch = async () => {
    await executeSearch({ profileId: selectedProfile || '', search });
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

        <input value={ search } disabled={ isSearching } onChange={ onChangeSearch } />

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
