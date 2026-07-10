'use client';
import { useEffect, useState } from 'react';

type Team = { id: string; name: string };

export default function AudienceSelector({ defaultTeamIds = [] }: { defaultTeamIds?: string[] }) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [restricted, setRestricted] = useState(defaultTeamIds.length > 0);

  useEffect(() => {
    fetch('/api/admin/teams').then(r => r.ok ? r.json() : { teams: [] }).then(data => setTeams(data.teams || []));
  }, []);

  return <fieldset className="settings-card" style={{ padding: 16 }}>
    <legend style={{ fontWeight: 700, padding: '0 6px' }}>Who can see this?</legend>
    <label style={{ display: 'block', marginBottom: 10 }}><input type="radio" name="audience" value="everyone" checked={!restricted} onChange={() => setRestricted(false)} /> Everyone</label>
    <label style={{ display: 'block', marginBottom: 10 }}><input type="radio" name="audience" value="teams" checked={restricted} onChange={() => setRestricted(true)} /> Only selected teams/groups</label>
    {restricted && <div style={{ display: 'grid', gap: 8, marginLeft: 20 }}>
      {teams.length === 0 ? <small>No teams available. Create a team first.</small> : teams.map(team => <label key={team.id}><input type="checkbox" name="audienceTeamIds" value={team.id} defaultChecked={defaultTeamIds.includes(team.id)} /> {team.name}</label>)}
    </div>}
  </fieldset>;
}
