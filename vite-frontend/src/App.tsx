import { useState } from 'react';
import '@picocss/pico/css/pico.min.css';
import { Profile } from './lib/types';
import { getProfiles, getEvents } from './lib/api';
import { format } from 'date-fns';
import { EventResponse } from './lib/api.types';

function App() {
  const [selectedProfile, setSelectedProfile] = useState(null as string | null);
  const [profiles, setProfiles] = useState([] as Profile[]);
  const [events, setEvents] = useState([] as EventResponse[]);

  if (profiles.length === 0) {
    getProfiles().then((result) => {
      setProfiles(result);
    });
  }

  const onChangeSelectedProfile = async (event) => {
    setSelectedProfile(event.currentTarget.value);
    if (event.currentTarget.value) {
      const { events } = await getEvents(event.currentTarget.value);
      setEvents(events);
    }
  };

  return (
    <div>
      <form>
        <select id="profile" value={ selectedProfile || '' } onChange={ onChangeSelectedProfile }>
          { !selectedProfile && (
            <option value="">Select a profile</option>
          )}
          {profiles.map((profile) => (
            <option key={ profile.profileId } value={ profile.profileId }>{ profile.name }</option>
          ))}
        </select>
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
        <pre>{ JSON.stringify(events, null, 2) }</pre>
      </div>
    </div>
  );
}

export default App;
