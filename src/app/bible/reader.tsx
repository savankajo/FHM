'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BIBLE_VERSIONS, BibleVersion } from '@/lib/bible-api';
import { buildVerseSelectionText, formatVerseRanges, normalizeVerseNumbers, toggleVerseNumber } from './verse-selection';

type Book = { id: string; name: string; nameLong?: string; chapters?: Array<{ id: string; number: string }> };
type Chapter = { id: string; reference: string; content: string; copyright: string; verseCount: number };
type Annotation = { color: string; note: string };
declare global { interface Window { fums?: (...args: unknown[]) => void; fumsData?: unknown[] } }

const NOTES_KEY = 'fhm-bible-notes-v2';
const FONT_SIZE_KEY = 'fhm-bible-font-size';
const RECENTS_KEY = 'fhm-bible-recents-v1';
const COLORS = ['', 'yellow', 'green', 'blue', 'pink'];
const COLOR_LABELS: Record<string, string> = { '': 'Remove highlight', yellow: 'Yellow highlight', green: 'Green highlight', blue: 'Blue highlight', pink: 'Pink highlight' };

export default function BibleReader() {
  const [version, setVersion] = useState<BibleVersion>('AVD');
  const [books, setBooks] = useState<Book[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterId] = useState('');
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [annotations, setAnnotations] = useState<Record<string, Annotation>>({});
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [editingVerse, setEditingVerse] = useState<number | null>(null);
  const [selectionStatus, setSelectionStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(19);
  const [showAppearance, setShowAppearance] = useState(false);
  const [testament, setTestament] = useState<'ALL'|'OT'|'NT'>('ALL');
  const [recents, setRecents] = useState<Array<{bookId:string;chapterId:string;label:string}>>([]);
  const [showVersePicker, setShowVersePicker] = useState(false);
  const scriptureRef = useRef<HTMLDivElement>(null);
  const orderedSelection = useMemo(() => normalizeVerseNumbers(selectedVerses), [selectedVerses]);
  const selectedRange = formatVerseRanges(orderedSelection);

  useEffect(() => {
    try {
      setAnnotations(JSON.parse(localStorage.getItem(NOTES_KEY) || '{}'));
      setFontSize(Number(localStorage.getItem(FONT_SIZE_KEY)) || 19);
      setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'));
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    setChapter(null);
    setBook(null);
    setChapterId('');
    clearSelection();
    fetch(`/api/bible/books?version=${version}`)
      .then(async response => { const json = await response.json(); if (!response.ok) throw new Error(json.error); return json; })
      .then(json => setBooks(json.data || []))
      .catch(reason => setError(reason.message))
      .finally(() => setLoading(false));
  }, [version]);

  useEffect(() => {
    if (!chapterId) return;
    setLoading(true);
    setError('');
    fetch(`/api/bible/chapter?version=${version}&chapter=${encodeURIComponent(chapterId)}`)
      .then(async response => { const json = await response.json(); if (!response.ok) throw new Error(json.error); return json; })
      .then(json => {
        setChapter(json.data);
        clearSelection();
        setRecents(previous => {
          const recent = { bookId: book?.id || '', chapterId, label: json.data.reference };
          const next = [recent, ...previous.filter(item => item.chapterId !== chapterId)].slice(0, 6);
          localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
          return next;
        });
        window.fumsData = window.fumsData || [];
        window.fums = window.fums || ((...args) => window.fumsData!.push(args));
        if (json.meta?.fumsToken) window.fums('trackView', json.meta.fumsToken);
      })
      .catch(reason => setError(reason.message))
      .finally(() => setLoading(false));
  }, [book?.id, chapterId, version]);

  const noteKey = `${version}:${chapterId}:${editingVerse || ''}`;
  const annotation = annotations[noteKey] || { color: '', note: '' };

  function save(patch: Partial<Annotation>) {
    if (!editingVerse) return;
    const next = { ...annotations, [noteKey]: { ...annotation, ...patch } };
    setAnnotations(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  function clearSelection(message = '') {
    setSelectedVerses([]);
    setEditingVerse(null);
    setSelectionStatus(message);
  }

  function verseNumberFromTarget(target: EventTarget | null) {
    const element = (target as HTMLElement | null)?.closest?.('[data-verse-id]') as HTMLElement | null;
    const value = Number(element?.dataset.verseId?.split('.').pop());
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  function toggleVerse(verse: number) {
    setEditingVerse(null);
    setSelectedVerses(previous => {
      const wasSelected = previous.includes(verse);
      const next = toggleVerseNumber(previous, verse);
      setSelectionStatus(`Verse ${verse} ${wasSelected ? 'deselected' : 'selected'}. ${next.length} ${next.length === 1 ? 'verse' : 'verses'} selected.`);
      return next;
    });
  }

  function chooseVerse(event: React.MouseEvent<HTMLElement>) {
    const verse = verseNumberFromTarget(event.target);
    if (verse) toggleVerse(verse);
  }

  function chooseVerseWithKeyboard(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const verse = verseNumberFromTarget(event.target);
    if (!verse) return;
    event.preventDefault();
    toggleVerse(verse);
  }

  function changeFontSize(value: number) {
    const next = Math.min(30, Math.max(15, value));
    setFontSize(next);
    localStorage.setItem(FONT_SIZE_KEY, String(next));
  }

  function selectedVerseText() {
    const root = scriptureRef.current;
    if (!root || !chapter) return '';
    const selected = orderedSelection.map(number => {
      const source = root.querySelector<HTMLElement>(`[data-verse-id$=".${number}"]`);
      if (!source) return { number, text: '' };
      const clone = source.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.v').forEach(element => element.remove());
      return { number, text: clone.textContent?.replace(/\s+/g, ' ').trim() || '' };
    });
    return buildVerseSelectionText(chapter.reference, version, selected);
  }

  async function copySelection(successMessage = 'Selection copied.') {
    const text = selectedVerseText();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement('textarea');
      field.value = text;
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    setSelectionStatus(successMessage);
  }

  async function shareSelection() {
    const text = selectedVerseText();
    if (!text) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: `${chapter?.reference}:${selectedRange}`, text });
        setSelectionStatus('Share sheet opened.');
        return;
      } catch (reason) {
        if (reason instanceof DOMException && reason.name === 'AbortError') return;
      }
    }
    await copySelection('Sharing is unavailable here, so the selection was copied.');
  }

  useEffect(() => {
    const root = scriptureRef.current;
    if (!root || !chapterId) return;
    root.querySelectorAll<HTMLElement>('[data-verse-id]').forEach(element => {
      element.classList.remove('verse-highlight-yellow', 'verse-highlight-green', 'verse-highlight-blue', 'verse-highlight-pink', 'verse-selected');
      const verse = Number(element.dataset.verseId?.split('.').pop());
      if (!Number.isInteger(verse) || verse < 1) return;
      const saved = annotations[`${version}:${chapterId}:${verse}`];
      if (saved?.color) element.classList.add(`verse-highlight-${saved.color}`);
      const isSelected = orderedSelection.includes(verse);
      if (isSelected) element.classList.add('verse-selected');
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      element.setAttribute('aria-pressed', String(isSelected));
      element.setAttribute('aria-label', `Verse ${verse}. ${isSelected ? 'Selected. ' : ''}Tap to ${isSelected ? 'deselect' : 'select'}.`);
    });
  });

  return <div className="bible-live-page">
    <header className="bible-live-header">
      <Link href="/" aria-label="Close Bible">×</Link>
      <div><strong>Bible</strong><span>{BIBLE_VERSIONS[version].name}</span></div>
      <button onClick={() => { setBook(null); setChapter(null); setChapterId(''); setShowVersePicker(false); clearSelection(); }}>Books</button>
    </header>

    <div className="bible-live-versions" aria-label="Bible translation">
      {(Object.keys(BIBLE_VERSIONS) as BibleVersion[]).map(item => <button key={item} className={item === version ? 'active' : ''} aria-pressed={item === version} onClick={() => setVersion(item)}>{item}</button>)}
    </div>

    <div className="bible-reader-tools">
      <button onClick={() => setShowAppearance(value => !value)} aria-expanded={showAppearance} aria-controls="bible-font-control">Aa <span>Text size</span></button>
      {showAppearance && <div id="bible-font-control" className="bible-font-control">
        <button type="button" onClick={() => changeFontSize(fontSize - 1)} disabled={fontSize <= 15} aria-label="Decrease scripture text size">A−</button>
        <input type="range" min="15" max="30" step="1" value={fontSize} onChange={event => changeFontSize(Number(event.target.value))} aria-label="Scripture text size" />
        <button type="button" onClick={() => changeFontSize(fontSize + 1)} disabled={fontSize >= 30} aria-label="Increase scripture text size">A+</button>
        <output aria-live="polite">{fontSize}px</output>
      </div>}
    </div>

    <p className="sr-only" aria-live="polite">{selectionStatus}</p>
    {loading && <div className="bible-live-status" role="status">Loading Scripture…</div>}
    {error && <div className="bible-live-error" role="alert"><strong>{version} is temporarily unavailable</strong><span>{error === 'API_BIBLE_KEY is not configured' ? 'Choose AVD above to continue reading. The English Bible service still needs its server credential.' : error}</span></div>}

    {!book && !loading && !error && <section className="bible-live-books">
      <div className="bible-section-heading"><p className="page-kicker">Choose where to read</p><h1>Books</h1></div>
      <div className="bible-testament-tabs" aria-label="Filter Bible books">{(['ALL','OT','NT'] as const).map(item => <button className={testament === item ? 'active' : ''} aria-pressed={testament === item} key={item} onClick={() => setTestament(item)}>{item === 'ALL' ? 'All' : item === 'OT' ? 'Old Testament' : 'New Testament'}</button>)}</div>
      <div className="bible-book-grid">{books.filter((_, index) => testament === 'ALL' || (testament === 'OT' ? index < 39 : index >= 39)).map(item => <button key={item.id} dir="auto" onClick={() => setBook(item)}>{item.nameLong || item.name}<span aria-hidden="true">›</span></button>)}</div>
      {recents.length > 0 && <div className="bible-recents"><h2>Recently read</h2>{recents.map(recent => <button key={recent.chapterId} onClick={() => { const recentBook = books.find(item => item.id === recent.bookId); if (recentBook) setBook(recentBook); setChapterId(recent.chapterId); setShowVersePicker(false); }}>{recent.label}</button>)}</div>}
    </section>}

    {book && !chapterId && <section className="bible-live-picker">
      <button className="bible-inline-back" onClick={() => setBook(null)}><span aria-hidden="true">‹</span> Books</button>
      <p className="page-kicker">Choose a chapter</p><h1 dir="auto">{book.nameLong || book.name}</h1>
      <div className="bible-chapter-list">{(book.chapters || []).filter(item => item.number !== 'intro').map(item => <button key={item.id} onClick={() => { setChapterId(item.id); setShowVersePicker(true); }}><span>Chapter {item.number}</span><span aria-hidden="true">›</span></button>)}</div>
    </section>}

    {chapter && showVersePicker && <section className="bible-live-picker">
      <button className="bible-inline-back" onClick={() => { setChapterId(''); setChapter(null); setShowVersePicker(false); clearSelection(); }}><span aria-hidden="true">‹</span> Chapters</button>
      <p className="page-kicker">Jump into the chapter</p><h1>Select a verse</h1>
      <div className="bible-verse-grid">{Array.from({ length: chapter.verseCount }, (_, index) => index + 1).map(verse => <button key={verse} onClick={() => { setSelectedVerses([verse]); setSelectionStatus(`Verse ${verse} selected.`); setShowVersePicker(false); setTimeout(() => scriptureRef.current?.querySelector<HTMLElement>(`[data-verse-id$=".${verse}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50); }}>{verse}</button>)}</div>
    </section>}

    {chapter && !showVersePicker && <section className="bible-live-reader">
      <button className="bible-inline-back" onClick={() => setShowVersePicker(true)}><span aria-hidden="true">#</span> Jump to verse</button>
      <p className="page-kicker">Tap any verse to select it</p><h1 dir="auto">{chapter.reference}</h1>
      {orderedSelection.length > 0 && <div className="bible-selection-toolbar" role="toolbar" aria-label={`${orderedSelection.length} ${orderedSelection.length === 1 ? 'verse' : 'verses'} selected`}>
        <div className="bible-selection-summary"><span className="bible-selection-check" aria-hidden="true">✓</span><div><strong>{orderedSelection.length} {orderedSelection.length === 1 ? 'verse' : 'verses'}</strong><small><bdi dir="auto">{chapter.reference}</bdi><span dir="ltr">:{selectedRange}</span></small></div></div>
        <div className="bible-selection-actions">
          <button type="button" onClick={() => copySelection()}>Copy</button>
          <button type="button" onClick={shareSelection}>Share</button>
          {orderedSelection.length === 1 && <button type="button" onClick={() => setEditingVerse(orderedSelection[0])}>Note</button>}
          <button type="button" className="clear" onClick={() => clearSelection('Selection cleared.')}>Clear</button>
        </div>
      </div>}
      <div
        ref={scriptureRef}
        className="eb-container bible-scripture"
        style={{ fontSize: `${fontSize}px` }}
        dir={version === 'AVD' ? 'rtl' : 'ltr'}
        aria-label={`${chapter.reference}. Tap verses to select more than one.`}
        onClick={chooseVerse}
        onKeyDown={chooseVerseWithKeyboard}
        dangerouslySetInnerHTML={{ __html: chapter.content }}
      />
      <div className="bible-copyright">{chapter.copyright}</div>
      {editingVerse && <aside className={`bible-note-sheet highlight-${annotation.color}`} role="dialog" aria-labelledby="bible-note-title">
        <strong id="bible-note-title">{chapter.reference}:{editingVerse}</strong>
        <button className="bible-note-close" onClick={() => setEditingVerse(null)} aria-label="Close verse note">×</button>
        <p>Highlight and private note</p>
        <div className="bible-note-colors" aria-label="Verse highlight color">{COLORS.map(color => <button key={color || 'none'} className={`color-${color || 'none'}${annotation.color === color ? ' active' : ''}`} onClick={() => save({ color })} aria-label={COLOR_LABELS[color]} aria-pressed={annotation.color === color} />)}</div>
        <label className="sr-only" htmlFor="bible-private-note">Private note for verse {editingVerse}</label>
        <textarea id="bible-private-note" value={annotation.note} onChange={event => save({ note: event.target.value })} placeholder="Add a private note…" maxLength={1000} />
        <small>Saved on this device</small>
      </aside>}
    </section>}
  </div>;
}
