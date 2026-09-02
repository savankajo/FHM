'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { formatVerseRanges } from '@/app/bible/verse-selection';
import { buildBiblePassageHref } from '@/lib/bible-annotations';

type BibleNote = {
    id: string;
    version: string;
    bookId: string;
    chapterId: string;
    chapterReference: string;
    verseKey: string;
    verses: number[];
    note: string;
    createdAt: string;
    updatedAt: string;
};
type BibleHighlight = { id: string; version: string; chapterId: string; verse: number; color: string };

export default function BibleNotesList() {
    const [notes, setNotes] = useState<BibleNote[]>([]);
    const [highlights, setHighlights] = useState<BibleHighlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [draft, setDraft] = useState('');
    const [busyId, setBusyId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const load = useCallback(async () => {
        setError('');
        try {
            const response = await fetch('/api/bible/annotations');
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not load Bible notes.');
            setNotes(data.notes || []);
            setHighlights(data.highlights || []);
        } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not load Bible notes.'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { void load(); }, [load]);

    async function updateNote(note: BibleNote) {
        const cleanDraft = draft.trim();
        if (!cleanDraft || busyId) return;
        setBusyId(note.id); setError('');
        try {
            const response = await fetch('/api/bible/annotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'note', version: note.version, bookId: note.bookId, chapterId: note.chapterId, chapterReference: note.chapterReference, verses: note.verses, note: cleanDraft }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not update note.');
            setNotes(previous => previous.map(item => item.id === note.id ? data.note : item));
            setEditingId(null);
        } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not update note.'); }
        finally { setBusyId(null); }
    }

    async function deleteNote(note: BibleNote) {
        if (busyId || !window.confirm(`Delete your private note for ${note.chapterReference}:${formatVerseRanges(note.verses)}?`)) return;
        setBusyId(note.id); setError('');
        try {
            const response = await fetch('/api/bible/annotations', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: note.id }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not delete note.');
            setNotes(previous => previous.filter(item => item.id !== note.id));
        } catch (reason) { setError(reason instanceof Error ? reason.message : 'Could not delete note.'); }
        finally { setBusyId(null); }
    }

    if (loading) return <div className="bible-notes-state" role="status">Loading your private notes…</div>;

    return <section className="bible-notes-section" aria-labelledby="bible-notes-heading">
        <div className="bible-notes-intro"><h2 id="bible-notes-heading">Your saved reflections</h2><p>Only your signed-in account can load, edit, or delete these notes.</p></div>
        {error && <div className="error-alert bible-notes-error" role="alert"><span>{error}</span><button type="button" onClick={() => void load()}>Try again</button></div>}
        {notes.length === 0 ? <div className="settings-card bible-notes-empty"><strong>No Bible notes yet</strong><p>Select one or more verses in the Bible reader, then choose Add note.</p><Link href="/bible" className="btn btn-primary">Open Bible</Link></div> : <div className="bible-notes-list">
            {notes.map(note => {
                const reference = `${note.chapterReference}:${formatVerseRanges(note.verses)}`;
                const href = buildBiblePassageHref({ version: note.version, chapterId: note.chapterId, verses: note.verses, returnTo: '/profile/bible-notes' });
                const editing = editingId === note.id;
                const relatedColors = Array.from(new Set(highlights.filter(highlight => highlight.version === note.version && highlight.chapterId === note.chapterId && note.verses.includes(highlight.verse)).map(highlight => highlight.color)));
                const expanded = expandedId === note.id;
                return <article className="settings-card bible-note-card" key={note.id}>
                    <div className="bible-note-card-head"><div><span className="bible-note-version">{note.version}</span><h3 dir="auto"><Link href={href}>{reference}</Link></h3></div>{relatedColors.length > 0 && <div className="bible-note-highlights" aria-label={`Related highlights: ${relatedColors.join(', ')}`}>{relatedColors.map(color => <span className={`highlight-${color}`} key={color} title={`${color} highlight`} />)}</div>}</div>
                    <div className="bible-note-dates"><span>Created <time dateTime={note.createdAt}>{new Date(note.createdAt).toLocaleDateString()}</time></span><span>Updated <time dateTime={note.updatedAt}>{new Date(note.updatedAt).toLocaleDateString()}</time></span></div>
                    {editing ? <label className="bible-note-edit">Edit private note<textarea value={draft} onChange={event => setDraft(event.target.value)} maxLength={2000} autoFocus /></label> : <button type="button" className="bible-note-toggle" aria-expanded={expanded} onClick={() => setExpandedId(current => current === note.id ? null : note.id)}><span className={`bible-note-preview${expanded ? ' expanded' : ''}`}>{note.note}</span><small>{expanded ? 'Show less' : 'Read full note'}</small></button>}
                    <div className="bible-note-card-actions">
                        {editing ? <><button type="button" className="primary" disabled={!draft.trim() || busyId === note.id} onClick={() => void updateNote(note)}>{busyId === note.id ? 'Saving…' : 'Save'}</button><button type="button" disabled={busyId === note.id} onClick={() => setEditingId(null)}>Cancel</button></> : <><Link href={href}>Open passage</Link><button type="button" onClick={() => { setEditingId(note.id); setDraft(note.note); }}>Edit</button><button type="button" className="delete" disabled={busyId === note.id} onClick={() => void deleteNote(note)}>{busyId === note.id ? 'Deleting…' : 'Delete'}</button></>}
                    </div>
                </article>;
            })}
        </div>}
        <style jsx>{`
            .bible-notes-section { display: grid; gap: 16px; padding: 0 0 28px; }
            .bible-notes-intro h2, .bible-notes-intro p { margin: 0; }
            .bible-notes-intro h2 { font-size: 1.1rem; }
            .bible-notes-intro p { margin-top: 5px; color: var(--text-secondary); line-height: 1.5; }
            .bible-notes-list { display: grid; gap: 12px; }
            .bible-note-card { display: grid; gap: 13px; padding: 18px; }
            .bible-note-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
            .bible-note-card h3 { margin: 4px 0 0; font-size: 1.05rem; }
            .bible-note-card h3 a { color: var(--primary); text-decoration: none; }
            .bible-note-card time, .bible-note-version { color: var(--text-secondary); font-size: .72rem; }
            .bible-note-version { font-weight: 900; letter-spacing: .08em; }
            .bible-note-dates { display: flex; flex-wrap: wrap; gap: 6px 16px; color: var(--text-secondary); font-size: .72rem; }
            .bible-note-toggle { min-height: 44px; display: grid; gap: 5px; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; }
            .bible-note-toggle small { color: var(--primary); font-weight: 800; }
            .bible-note-preview { display: -webkit-box; margin: 0; overflow: hidden; color: var(--text-primary); line-height: 1.65; white-space: pre-wrap; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
            .bible-note-preview.expanded { display: block; overflow: visible; }
            .bible-note-highlights { display: flex; gap: 5px; }
            .bible-note-highlights span { width: 18px; height: 18px; border: 1px solid var(--border); border-radius: 50%; }
            .bible-note-highlights .highlight-yellow { background: #f2c94c; }
            .bible-note-highlights .highlight-green { background: #67c587; }
            .bible-note-highlights .highlight-blue { background: #65a9e8; }
            .bible-note-highlights .highlight-pink { background: #e889ad; }
            .bible-note-edit { display: grid; gap: 7px; font-size: .78rem; font-weight: 800; }
            .bible-note-edit textarea { min-height: 130px; padding: 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-muted); color: var(--text-primary); resize: vertical; }
            .bible-note-card-actions { display: flex; flex-wrap: wrap; gap: 8px; }
            .bible-note-card-actions a, .bible-note-card-actions button { min-height: 44px; display: inline-flex; align-items: center; justify-content: center; padding: 9px 13px; border: 1px solid var(--border); border-radius: 12px; background: var(--bg-card); color: var(--text-primary); font-weight: 800; text-decoration: none; }
            .bible-note-card-actions a, .bible-note-card-actions .primary { border-color: var(--primary); background: var(--primary); color: var(--text-on-primary); }
            .bible-note-card-actions .delete { color: #ef4444; }
            .bible-notes-empty { display: grid; justify-items: start; gap: 8px; padding: 20px; }
            .bible-notes-empty p { margin: 0 0 5px; color: var(--text-secondary); line-height: 1.5; }
            .bible-notes-error { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; border-radius: 12px; }
            .bible-notes-error button { min-height: 44px; padding: 8px 12px; border: 1px solid currentColor; border-radius: 10px; background: transparent; color: inherit; }
            @media (min-width: 700px) { .bible-notes-list { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        `}</style>
    </section>;
}
