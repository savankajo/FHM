'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { BIBLE_VERSIONS, BibleVersion } from '@/lib/bible-api';

type Book = { id: string; name: string; nameLong?: string; chapters?: Array<{ id: string; number: string }> };
type Chapter = { id: string; reference: string; content: string; copyright: string; verseCount: number };
type Annotation = { color: string; note: string };
declare global { interface Window { fums?: (...args: unknown[]) => void; fumsData?: unknown[] } }

const NOTES_KEY = 'fhm-bible-notes-v2';
const FONT_SIZE_KEY = 'fhm-bible-font-size';
const RECENTS_KEY = 'fhm-bible-recents-v1';
const COLORS = ['', 'yellow', 'green', 'blue', 'pink'];

export default function BibleReader() {
  const [version, setVersion] = useState<BibleVersion>('NIV');
  const [books, setBooks] = useState<Book[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterId] = useState('');
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, Annotation>>({});
  const [selectedVerse, setSelectedVerse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(19);
  const [showAppearance, setShowAppearance] = useState(false);
  const [testament, setTestament] = useState<'ALL'|'OT'|'NT'>('ALL');
  const [recents, setRecents] = useState<Array<{bookId:string;chapterId:string;label:string}>>([]);
  const [showVersePicker, setShowVersePicker] = useState(false);
  const scriptureRef = useRef<HTMLDivElement>(null);

  useEffect(() => { try { setAnnotations(JSON.parse(localStorage.getItem(NOTES_KEY) || '{}')); setFontSize(Number(localStorage.getItem(FONT_SIZE_KEY)) || 19); setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]')); } catch {} }, []);
  useEffect(() => {
    setLoading(true); setError(''); setChapter(null); setBook(null); setChapterId('');
    fetch(`/api/bible/books?version=${version}`).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; })
      .then(j => setBooks(j.data || [])).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [version]);
  useEffect(() => {
    if (!chapterId) return;
    setLoading(true); setError('');
    fetch(`/api/bible/chapter?version=${version}&chapter=${encodeURIComponent(chapterId)}`).then(async r => { const j = await r.json(); if (!r.ok) throw new Error(j.error); return j; })
      .then(j => { setChapter(j.data); setSelectedVerse(''); setRecents(previous => { const recent={bookId:book?.id||'',chapterId,label:j.data.reference}; const next=[recent,...previous.filter(r=>r.chapterId!==chapterId)].slice(0,6); localStorage.setItem(RECENTS_KEY,JSON.stringify(next)); return next; }); window.fumsData = window.fumsData || []; window.fums = window.fums || ((...args) => window.fumsData!.push(args)); if (j.meta?.fumsToken) window.fums('trackView', j.meta.fumsToken); })
      .catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [book?.id, chapterId, version]);

  const noteKey = `${version}:${chapterId}:${selectedVerse}`;
  const annotation = annotations[noteKey] || { color: '', note: '' };
  function save(patch: Partial<Annotation>) { const next = { ...annotations, [noteKey]: { ...annotation, ...patch } }; setAnnotations(next); localStorage.setItem(NOTES_KEY, JSON.stringify(next)); }
  function chooseVerse(event: React.MouseEvent<HTMLElement>) { const target = (event.target as HTMLElement).closest('[data-verse-id]') as HTMLElement | null; const id = target?.dataset.verseId; if (id) setSelectedVerse(id.split('.').pop() || ''); }
  function changeFontSize(value: number) { setFontSize(value); localStorage.setItem(FONT_SIZE_KEY, String(value)); }
  useEffect(() => {
    const root = scriptureRef.current;
    if (!root || !chapterId) return;
    root.querySelectorAll<HTMLElement>('[data-verse-id]').forEach(element => {
      element.classList.remove('verse-highlight-yellow', 'verse-highlight-green', 'verse-highlight-blue', 'verse-highlight-pink', 'verse-selected');
      const verse = element.dataset.verseId?.split('.').pop() || '';
      const saved = annotations[`${version}:${chapterId}:${verse}`];
      if (saved?.color) element.classList.add(`verse-highlight-${saved.color}`);
      if (verse === selectedVerse) element.classList.add('verse-selected');
    });
  }, [annotations, chapter, chapterId, selectedVerse, version]);

  return <div className="bible-live-page">
    <header className="bible-live-header"><Link href="/" aria-label="Close Bible">×</Link><div><strong>Bible</strong><span>{BIBLE_VERSIONS[version].name}</span></div><button onClick={() => { setBook(null); setChapter(null); setChapterId(''); }}>Books</button></header>
    <div className="bible-live-versions">{(Object.keys(BIBLE_VERSIONS) as BibleVersion[]).map(v => <button key={v} className={v === version ? 'active' : ''} onClick={() => setVersion(v)}>{v}</button>)}</div>
    <div className="bible-reader-tools"><button onClick={() => setShowAppearance(value => !value)} aria-expanded={showAppearance}>Aa <span>Text size</span></button>{showAppearance && <div className="bible-font-control"><span>A</span><input type="range" min="15" max="30" step="1" value={fontSize} onChange={event => changeFontSize(Number(event.target.value))} aria-label="Scripture text size" /><strong>A</strong><output>{fontSize}px</output></div>}</div>
    {loading && <div className="bible-live-status">Loading Scripture…</div>}
    {error && <div className="bible-live-error"><strong>Scripture unavailable</strong><span>{error === 'API_BIBLE_KEY is not configured' ? 'The API.Bible key must be added to the server.' : error}</span></div>}
    {!book && !loading && !error && <section className="bible-live-books"><h1>Books</h1><div className="bible-testament-tabs">{(['ALL','OT','NT'] as const).map(t=><button className={testament===t?'active':''} key={t} onClick={()=>setTestament(t)}>{t==='ALL'?'All':t==='OT'?'Old Testament':'New Testament'}</button>)}</div><div className="bible-book-grid">{books.filter((_,i)=>testament==='ALL'||(testament==='OT'?i<39:i>=39)).map(item => <button key={item.id} onClick={() => setBook(item)}>{item.nameLong || item.name}</button>)}</div>{recents.length>0&&<div className="bible-recents"><h2>Recents</h2>{recents.map(r=><button key={r.chapterId} onClick={()=>{const recentBook=books.find(b=>b.id===r.bookId);if(recentBook)setBook(recentBook);setChapterId(r.chapterId);setShowVersePicker(false);}}>{r.label}</button>)}</div>}</section>}
    {book && !chapterId && <section className="bible-live-picker"><button className="bible-inline-back" onClick={() => setBook(null)}><span aria-hidden="true">‹</span> Books</button><h1>{book.nameLong || book.name}</h1><div>{(book.chapters || []).filter(c => c.number !== 'intro').map(c => <button key={c.id} onClick={() => {setChapterId(c.id);setShowVersePicker(true);}}>{c.number}</button>)}</div></section>}
    {chapter && showVersePicker && <section className="bible-live-picker"><button className="bible-inline-back" onClick={()=>{setChapterId('');setChapter(null);setShowVersePicker(false);}}>‹ Chapters</button><h1>Select Verse</h1><div>{Array.from({length:chapter.verseCount},(_,i)=>i+1).map(verse=><button key={verse} onClick={()=>{setSelectedVerse(String(verse));setShowVersePicker(false);setTimeout(()=>scriptureRef.current?.querySelector<HTMLElement>(`[data-verse-id$=\".${verse}\"]`)?.scrollIntoView({behavior:'smooth',block:'center'}),50);}}>{verse}</button>)}</div></section>}
    {chapter && !showVersePicker && <section className="bible-live-reader">
      <button className="bible-inline-back" onClick={() => setShowVersePicker(true)}><span aria-hidden="true">#</span> Select Verse</button><h1>{chapter.reference}</h1>
      <div ref={scriptureRef} className="eb-container bible-scripture" style={{ fontSize: `${fontSize}px` }} onClick={chooseVerse} dangerouslySetInnerHTML={{ __html: chapter.content }} />
      <div className="bible-copyright">{chapter.copyright}</div>
      {selectedVerse && <aside className={`bible-note-sheet highlight-${annotation.color}`}><strong>{chapter.reference}:{selectedVerse}</strong><button className="bible-note-close" onClick={() => setSelectedVerse('')}>×</button><div className="bible-note-colors">{COLORS.map(c => <button key={c || 'none'} className={`color-${c || 'none'}${annotation.color === c ? ' active' : ''}`} onClick={() => save({ color: c })} />)}</div><textarea value={annotation.note} onChange={e => save({ note: e.target.value })} placeholder="Add a private note…" /><small>Saved on this device</small></aside>}
    </section>}
  </div>;
}
