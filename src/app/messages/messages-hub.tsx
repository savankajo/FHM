'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Person = { id: string; name: string };
type FriendRequest = { id: string; user: Person };
type DirectContact = Person & { preview: string | null; updatedAt: string | null };
type Team = { id: string; name: string; description: string | null; memberCount: number };

export default function MessagesHub({ contacts, teams, incoming: initialIncoming }: { contacts: DirectContact[]; teams: Team[]; incoming: FriendRequest[] }) {
  const [tab, setTab] = useState<'direct' | 'teams'>('direct');
  const [directoryOpen, setDirectoryOpen] = useState(false);
  const [friends, setFriends] = useState<Person[]>(contacts.map(({ id, name }) => ({ id, name })));
  const [incoming, setIncoming] = useState(initialIncoming);
  const [people, setPeople] = useState<Person[]>([]);
  const [outgoing, setOutgoing] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!directoryOpen) return;
    void fetch('/api/friends').then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load people.');
      setFriends(data.friends || []); setIncoming(data.incoming || []); setPeople(data.people || []); setOutgoing(data.outgoing || []); setError('');
    }).catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load people.'));
  }, [directoryOpen]);

  async function requestFriend(recipientId: string) {
    setBusy(recipientId); setError('');
    try {
      const response = await fetch('/api/friends', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientId }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not send request.');
      setOutgoing(current => [...current, recipientId]); setPeople(current => current.filter(person => person.id !== recipientId));
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not send request.'); } finally { setBusy(null); }
  }

  async function respond(requestId: string, decision: 'accept' | 'decline') {
    setBusy(requestId); setError('');
    try {
      const response = await fetch('/api/friends', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ requestId, decision }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update friend request.');
      setIncoming(current => current.filter(request => request.id !== requestId));
      router.refresh();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update friend request.'); } finally { setBusy(null); }
  }

  return <main className="messages-page">
    <header className="messages-hero"><div><p className="page-kicker">Stay connected</p><h1>Messages</h1><p>Private conversations with friends and messages from your assigned teams.</p></div><button type="button" className="messages-new-button" onClick={() => { setTab('direct'); setDirectoryOpen(true); }}>Add friend</button></header>
    <div className="messages-tabs" role="tablist" aria-label="Messages">
      <button type="button" role="tab" aria-selected={tab === 'direct'} className={tab === 'direct' ? 'active' : ''} onClick={() => setTab('direct')}>Direct messages</button>
      <button type="button" role="tab" aria-selected={tab === 'teams'} className={tab === 'teams' ? 'active' : ''} onClick={() => setTab('teams')}>Team messages</button>
    </div>

    {tab === 'direct' ? <section className="messages-section" aria-label="Direct messages">
      <div className="messages-section-heading"><div><h2>Friends</h2><p>Only accepted friends can message each other.</p></div><button type="button" className="messages-text-button" onClick={() => setDirectoryOpen(value => !value)}>{directoryOpen ? 'Close' : 'Manage friends'}</button></div>
      {contacts.length ? <div className="messages-list">{contacts.map(contact => <Link className="message-list-row" href={`/messages/direct/${contact.id}`} key={contact.id}><span className="message-avatar">{contact.name.slice(0, 1).toUpperCase()}</span><span className="message-list-copy"><strong>{contact.name}</strong><small>{contact.preview || 'Start a private conversation'}</small></span><span className="message-row-meta">{contact.updatedAt ? new Date(contact.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'New'}</span></Link>)}</div> : <div className="messages-empty"><strong>No direct conversations yet</strong><p>Add a friend, wait for them to accept, then you can message privately.</p><button type="button" className="btn btn-primary" onClick={() => setDirectoryOpen(true)}>Add a friend</button></div>}
      {directoryOpen && <section className="friend-manager" aria-label="Manage friends">
        <h2>Manage friends</h2>{error && <p className="friend-error" role="alert">{error}</p>}
        {incoming.length > 0 && <div className="friend-group"><h3>Requests for you</h3>{incoming.map(request => <div className="friend-row" key={request.id}><span>{request.user.name}</span><div><button type="button" className="btn btn-primary" disabled={busy === request.id} onClick={() => void respond(request.id, 'accept')}>Accept</button><button type="button" className="btn" disabled={busy === request.id} onClick={() => void respond(request.id, 'decline')}>Decline</button></div></div>)}</div>}
        {friends.length > 0 && <div className="friend-group"><h3>Your friends</h3>{friends.map(friend => <Link key={friend.id} className="friend-row friend-link" href={`/messages/direct/${friend.id}`}><span>{friend.name}</span><span>Message ›</span></Link>)}</div>}
        <div className="friend-group"><h3>Find people</h3>{people.length ? people.map(person => <div className="friend-row" key={person.id}><span>{person.name}</span><button type="button" className="btn" disabled={busy === person.id || outgoing.includes(person.id)} onClick={() => void requestFriend(person.id)}>{outgoing.includes(person.id) ? 'Request sent' : busy === person.id ? 'Sending…' : 'Add friend'}</button></div>) : <p>No other available people to add.</p>}</div>
      </section>}
    </section> : <section className="messages-section" aria-label="Team messages">
      <div className="messages-section-heading"><div><h2>My teams</h2><p>Only teams assigned to you by an administrator appear here.</p></div></div>
      {teams.length ? <div className="messages-list">{teams.map(team => <Link className="message-list-row" href={`/messages/team/${team.id}`} key={team.id}><span className="message-avatar message-team-avatar">♟</span><span className="message-list-copy"><strong>{team.name}</strong><small>{team.description || 'Open team conversation'}</small></span><span className="message-row-meta">{team.memberCount} members</span></Link>)}</div> : <div className="messages-empty"><strong>No team messages yet</strong><p>When an administrator adds you to a team, its conversation will appear here.</p></div>}
    </section>}
  </main>;
}
