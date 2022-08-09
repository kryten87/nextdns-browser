import { useState } from 'react';
import '@picocss/pico/css/pico.min.css';
import { Profile, Event } from './lib/types';
import { getProfiles, getEvents } from './lib/api';
import { format } from 'date-fns';

function App() {
  const [selectedProfile, setSelectedProfile] = useState(null as string | null);
  const [profiles, setProfiles] = useState([] as Profile[]);
  const [events, setEvents] = useState([] as Event[]);

  if (profiles.length === 0) {
    getProfiles().then((result) => {
      setProfiles(result);
    });
  }

  const onChangeSelectedProfile = async (event) => {
    setSelectedProfile(event.currentTarget.value);
    if (event.currentTarget.value) {
      setEvents(await getEvents(event.currentTarget.value));
    }
  };

  return (
    <div>
      <form>
        <select id="profile" value={ selectedProfile || '' } onChange={ onChangeSelectedProfile }>
          { !selectedProfile && (
            <option value="" selected>Select a profile</option>
          )}
          {profiles.map((profile) => (
            <option value={ profile.id }>{ profile.name }</option>
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
                <tr id={ event.id } >
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
