'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BIBLE_VERSIONS, BibleVersion } from '@/lib/bible-api';
import { buildVerseSelectionText, formatVerseRanges, normalizeVerseNumbers, toggleVerseNumber } from './verse-selection';

type Book = { id: string; name: string; nameLong?: string; chapters?: Array<{ id: string; number: string }> };
type Chapter = { id: string; reference: string; content: string; copyright: string; verseCount: number };
type LegacyAnnotation = { color: string; note: string };
type SavedHighlight = { id: string; version: string; bookId: string; chapterId: string; chapterReference: string; verse: number; color: string };
type SavedNote = { id: string; version: string; bookId: string; chapterId: string; chapterReference: string; verseKey: string; verses: number[]; note: string; updatedAt: string };
type BibleReaderProps = { signedIn: boolean; initialVersion?: BibleVersion; initialChapterId?: string; initialVerses?: number[]; returnTo?: string };
declare global { interface Window { fums?: (...args: unknown[]) => void; fumsData?: unknown[] } }

const NOTES_KEY = 'fhm-bible-notes-v2';
const FONT_SIZE_KEY = 'fhm-bible-font-size';
const RECENTS_KEY = 'fhm-bible-recents-v1';
const COLORS = ['', 'yellow', 'green', 'blue', 'pink'];
const COLOR_LABELS: Record<string, string> = { '': 'Remove highlight', yellow: 'Yellow highlight', green: 'Green highlight', blue: 'Blue highlight', pink: 'Pink highlight' };

export default function BibleReader({ signedIn, initialVersion = 'AVD', initialChapterId = '', initialVerses = [], returnTo = '/' }: BibleReaderProps) {
  const [version, setVersion] = useState<BibleVersion>(initialVersion);
  const [books, setBooks] = useState<Book[]>([]);
  const [book, setBook] = useState<Book | null>(null);
  const [chapterId, setChapterId] = useState('');
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [legacyAnnotations, setLegacyAnnotations] = useState<Record<string, LegacyAnnotation>>({});
  const [highlights, setHighlights] = useState<SavedHighlight[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);
  const [selectedVerses, setSelectedVerses] = useState<number[]>([]);
  const [editingVerses, setEditingVerses] = useState<number[] | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [noteInitial, setNoteInitial] = useState('');
  const [showDiscardPrompt, setShowDiscardPrompt] = useState(false);
  const [showHighlightColors, setShowHighlightColors] = useState(false);
  const [annotationBusy, setAnnotationBusy] = useState(false);
  const [selectionStatus, setSelectionStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fontSize, setFontSize] = useState(19);
  const [showAppearance, setShowAppearance] = useState(false);
  const [testament, setTestament] = useState<'ALL'|'OT'|'NT'>('ALL');
  const [recents, setRecents] = useState<Array<{bookId:string;chapterId:string;label:string}>>([]);
  const [showVersePicker, setShowVersePicker] = useState(false);
  const scriptureRef = useRef<HTMLDivElement>(null);
  const booksRef = useRef<Book[]>([]);
  const deepLinkRef = useRef(initialChapterId ? { version: initialVersion, chapterId: initialChapterId, verses: normalizeVerseNumbers(initialVerses) } : null);
  const orderedSelection = useMemo(() => normalizeVerseNumbers(selectedVerses), [selectedVerses]);
  const selectedRange = formatVerseRanges(orderedSelection);
  const verseKey = orderedSelection.join(',');

  useEffect(() => { booksRef.current = books; }, [books]);

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, fhmBibleStage: 'bible' }, '');
    const handleHistory = (event: PopStateEvent) => {
      const state = event.state as { fhmBibleStage?: string; bookId?: string; chapterId?: string; verses?: number[] } | null;
      if (!state?.fhmBibleStage) return;
      const historicalBook = state.bookId ? booksRef.current.find(item => item.id === state.bookId || item.chapters?.some(candidate => candidate.id === state.chapterId)) : null;
      if (state.fhmBibleStage === 'bible') {
        setBook(null); setChapterId(''); setChapter(null); setShowVersePicker(false); clearSelection();
      } else if (state.fhmBibleStage === 'book') {
        if (historicalBook) setBook(historicalBook);
        setChapterId(''); setChapter(null); setShowVersePicker(false); clearSelection();
      } else if (state.fhmBibleStage === 'chapter') {
        if (historicalBook) setBook(historicalBook);
        if (state.chapterId) setChapterId(state.chapterId);
        setSelectedVerses(normalizeVerseNumbers(state.verses || [])); setShowVersePicker(true); setEditingVerses(null);
      } else if (state.fhmBibleStage === 'verse') {
        if (historicalBook) setBook(historicalBook);
        if (state.chapterId) setChapterId(state.chapterId);
        setSelectedVerses(normalizeVerseNumbers(state.verses || [])); setShowVersePicker(false); setEditingVerses(null);
      }
    };
    window.addEventListener('popstate', handleHistory);
    return () => window.removeEventListener('popstate', handleHistory);
  }, []);

  const loadAnnotations = useCallback(async () => {
    if (!signedIn) return;
    const response = await fetch('/api/bible/annotations');
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Could not load private Bible notes.');
    setHighlights(data.highlights || []);
    setNotes(data.notes || []);
  }, [signedIn]);

  useEffect(() => {
    let legacy: Record<string, LegacyAnnotation> = {};
    try {
      legacy = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      setLegacyAnnotations(legacy);
      setFontSize(Number(localStorage.getItem(FONT_SIZE_KEY)) || 19);
      setRecents(JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'));
    } catch {}
    void (async () => {
      try {
        if (signedIn && Object.keys(legacy).length) {
          const entries = Object.entries(legacy).map(([key, value]) => ({ key, color: value.color, note: value.note }));
          const response = await fetch('/api/bible/annotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'legacy-import', entries }) });
          if (!response.ok) throw new Error('Existing device notes could not be synced yet. They remain safely on this device.');
          localStorage.removeItem(NOTES_KEY);
          setLegacyAnnotations({});
        }
        await loadAnnotations();
      } catch (reason) { setSelectionStatus(reason instanceof Error ? reason.message : 'Could not load private Bible notes.'); }
    })();
  }, [loadAnnotations, signedIn]);

  useEffect(() => {
    window.history.replaceState({ ...window.history.state, fhmBibleStage: 'bible' }, '');
    setLoading(true);
    setError('');
    setChapter(null);
    setBook(null);
    setChapterId('');
    clearSelection();
    fetch(`/api/bible/books?version=${version}`)
      .then(async response => { const json = await response.json(); if (!response.ok) throw new Error(json.error); return json; })
      .then(json => {
        const nextBooks: Book[] = json.data || [];
        setBooks(nextBooks);
        const deepLink = deepLinkRef.current;
        if (deepLink && deepLink.version === version) {
          const matchingBook = nextBooks.find(item => item.chapters?.some(candidate => candidate.id === deepLink.chapterId)) || nextBooks.find(item => deepLink.chapterId.startsWith(`${item.id}.`));
          if (matchingBook) setBook(matchingBook);
          setChapterId(deepLink.chapterId);
          setSelectedVerses(deepLink.verses);
          setShowVersePicker(false);
          window.history.replaceState({ ...window.history.state, fhmBibleStage: 'bible' }, '');
          window.history.pushState({ ...window.history.state, fhmBibleStage: 'book', bookId: matchingBook?.id }, '');
          window.history.pushState({ ...window.history.state, fhmBibleStage: 'chapter', bookId: matchingBook?.id, chapterId: deepLink.chapterId, verses: deepLink.verses }, '');
          window.history.pushState({ ...window.history.state, fhmBibleStage: 'verse', bookId: matchingBook?.id, chapterId: deepLink.chapterId, verses: deepLink.verses }, '');
          deepLinkRef.current = null;
        }
      })
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

  useEffect(() => {
    if (!chapter || showVersePicker || orderedSelection.length === 0) return;
    const verse = orderedSelection[0];
    const timeout = setTimeout(() => scriptureRef.current?.querySelector<HTMLElement>(`[data-verse-id$=".${verse}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80);
    return () => clearTimeout(timeout);
  }, [chapter, orderedSelection, showVersePicker]);

  function clearSelection(message = '') {
    setSelectedVerses([]);
    setEditingVerses(null);
    setShowHighlightColors(false);
    setSelectionStatus(message);
  }

  function openBook(nextBook: Book) {
    setBook(nextBook);
    setChapterId(''); setChapter(null); setShowVersePicker(false); clearSelection();
    window.history.pushState({ ...window.history.state, fhmBibleStage: 'book', bookId: nextBook.id }, '');
  }

  function openChapter(nextChapterId: string) {
    setChapterId(nextChapterId); setShowVersePicker(true); clearSelection();
    window.history.pushState({ ...window.history.state, fhmBibleStage: 'chapter', bookId: book?.id, chapterId: nextChapterId, verses: [] }, '');
  }

  function openVerse(verse: number) {
    setSelectedVerses([verse]); setSelectionStatus(`Verse ${verse} selected.`); setShowVersePicker(false);
    window.history.pushState({ ...window.history.state, fhmBibleStage: 'verse', bookId: book?.id, chapterId, verses: [verse] }, '');
  }

  function localKey(verses: number[]) {
    return `${version}:${chapterId}:${normalizeVerseNumbers(verses).join(',')}`;
  }

  function persistLegacy(next: Record<string, LegacyAnnotation>) {
    setLegacyAnnotations(next);
    localStorage.setItem(NOTES_KEY, JSON.stringify(next));
  }

  function verseNumberFromTarget(target: EventTarget | null) {
    const element = (target as HTMLElement | null)?.closest?.('[data-verse-id]') as HTMLElement | null;
    const value = Number(element?.dataset.verseId?.split('.').pop());
    return Number.isInteger(value) && value > 0 ? value : null;
  }

  function toggleVerse(verse: number) {
    setEditingVerses(null);
    setShowHighlightColors(false);
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
    try { await navigator.clipboard.writeText(text); }
    catch {
      const field = document.createElement('textarea');
      field.value = text; field.style.position = 'fixed'; field.style.opacity = '0';
      document.body.appendChild(field); field.select(); document.execCommand('copy'); field.remove();
    }
    setSelectionStatus(successMessage);
  }

  async function shareSelection() {
    const text = selectedVerseText();
    if (!text) return;
    if (navigator.share) {
      try { await navigator.share({ title: `${chapter?.reference}:${selectedRange}`, text }); setSelectionStatus('Share sheet opened.'); return; }
      catch (reason) { if (reason instanceof DOMException && reason.name === 'AbortError') return; }
    }
    await copySelection('Sharing is unavailable here, so the selection was copied.');
  }

  async function applyHighlight(color: string) {
    if (!book || !chapter || orderedSelection.length === 0 || annotationBusy) return;
    setAnnotationBusy(true);
    try {
      if (signedIn) {
        const response = await fetch('/api/bible/annotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'highlight', version, bookId: book.id, chapterId, chapterReference: chapter.reference, verses: orderedSelection, color }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not save highlight.');
        setHighlights(data.highlights || []);
      } else {
        const next = { ...legacyAnnotations };
        for (const verse of orderedSelection) {
          const key = localKey([verse]);
          next[key] = { ...(next[key] || { color: '', note: '' }), color };
        }
        persistLegacy(next);
      }
      setSelectionStatus(color ? `${COLOR_LABELS[color]} applied to ${orderedSelection.length} ${orderedSelection.length === 1 ? 'verse' : 'verses'}.` : 'Highlight removed.');
      setShowHighlightColors(false);
    } catch (reason) { setSelectionStatus(reason instanceof Error ? reason.message : 'Could not save highlight.'); }
    finally { setAnnotationBusy(false); }
  }

  function openNoteEditor() {
    const existing = notes.find(note => note.version === version && note.chapterId === chapterId && note.verseKey === verseKey);
    const legacy = legacyAnnotations[localKey(orderedSelection)];
    const currentNote = existing?.note || legacy?.note || '';
    setEditingVerses(orderedSelection);
    setNoteDraft(currentNote);
    setNoteInitial(currentNote);
    setShowDiscardPrompt(false);
  }

  function requestCloseNote() {
    if (noteDraft !== noteInitial) setShowDiscardPrompt(true);
    else setEditingVerses(null);
  }

  useEffect(() => {
    if (!editingVerses || noteDraft === noteInitial) return;
    const protectDraft = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', protectDraft);
    return () => window.removeEventListener('beforeunload', protectDraft);
  }, [editingVerses, noteDraft, noteInitial]);

  async function saveNote() {
    if (!book || !chapter || !editingVerses?.length || annotationBusy) return;
    const cleanNote = noteDraft.trim();
    if (!cleanNote) { setSelectionStatus('Write a note before saving.'); return; }
    setAnnotationBusy(true);
    try {
      if (signedIn) {
        const response = await fetch('/api/bible/annotations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'note', version, bookId: book.id, chapterId, chapterReference: chapter.reference, verses: editingVerses, note: cleanNote }) });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Could not save private note.');
        setNotes(previous => [data.note, ...previous.filter(item => item.id !== data.note.id && !(item.version === data.note.version && item.chapterId === data.note.chapterId && item.verseKey === data.note.verseKey))]);
      } else {
        const key = localKey(editingVerses);
        persistLegacy({ ...legacyAnnotations, [key]: { ...(legacyAnnotations[key] || { color: '', note: '' }), note: cleanNote } });
      }
      setEditingVerses(null);
      setShowDiscardPrompt(false);
      setSelectionStatus(`Private note saved for ${editingVerses.length} ${editingVerses.length === 1 ? 'verse' : 'verses'}.`);
    } catch (reason) { setSelectionStatus(reason instanceof Error ? reason.message : 'Could not save private note.'); }
    finally { setAnnotationBusy(false); }
  }

  useEffect(() => {
    const root = scriptureRef.current;
    if (!root || !chapterId) return;
    root.querySelectorAll<HTMLElement>('[data-verse-id]').forEach(element => {
      element.classList.remove('verse-highlight-yellow', 'verse-highlight-green', 'verse-highlight-blue', 'verse-highlight-pink', 'verse-selected');
      const verse = Number(element.dataset.verseId?.split('.').pop());
      if (!Number.isInteger(verse) || verse < 1) return;
      const savedColor = highlights.find(item => item.version === version && item.chapterId === chapterId && item.verse === verse)?.color || legacyAnnotations[`${version}:${chapterId}:${verse}`]?.color;
      if (savedColor) element.classList.add(`verse-highlight-${savedColor}`);
      const isSelected = orderedSelection.includes(verse);
      if (isSelected) element.classList.add('verse-selected');
      element.setAttribute('role', 'button');
      element.setAttribute('tabindex', '0');
      element.setAttribute('aria-pressed', String(isSelected));
      element.setAttribute('aria-label', `Verse ${verse}. ${isSelected ? 'Selected. ' : ''}Tap to ${isSelected ? 'deselect' : 'select'}.`);
    });
  }, [chapter, chapterId, highlights, legacyAnnotations, orderedSelection, version]);

  return <div className="bible-live-page">
    <header className="bible-live-header">
      <Link href={returnTo} onClick={event => { if (editingVerses && noteDraft !== noteInitial) { event.preventDefault(); requestCloseNote(); } }} aria-label={returnTo === '/profile/bible-notes' ? 'Back to Bible Notes' : 'Close Bible'}>×</Link>
      <div><strong>Bible</strong><span>{BIBLE_VERSIONS[version].name}</span></div>
      <button onClick={() => { if (editingVerses && noteDraft !== noteInitial) { requestCloseNote(); return; } setBook(null); setChapter(null); setChapterId(''); setShowVersePicker(false); clearSelection(); window.history.replaceState({ ...window.history.state, fhmBibleStage: 'bible' }, ''); }}>Books</button>
    </header>

    <div className="bible-live-versions" aria-label="Bible translation">
      {(Object.keys(BIBLE_VERSIONS) as BibleVersion[]).map(item => <button key={item} className={item === version ? 'active' : ''} aria-pressed={item === version} onClick={() => { if (editingVerses && noteDraft !== noteInitial) requestCloseNote(); else setVersion(item); }}>{item}</button>)}
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
      <div className="bible-book-grid">{books.filter((_, index) => testament === 'ALL' || (testament === 'OT' ? index < 39 : index >= 39)).map(item => <button key={item.id} dir="auto" onClick={() => openBook(item)}>{item.nameLong || item.name}<span aria-hidden="true">›</span></button>)}</div>
      {recents.length > 0 && <div className="bible-recents"><h2>Recently read</h2>{recents.map(recent => <button key={recent.chapterId} onClick={() => { const recentBook = books.find(item => item.id === recent.bookId); if (!recentBook) return; openBook(recentBook); setChapterId(recent.chapterId); setShowVersePicker(false); window.history.pushState({ ...window.history.state, fhmBibleStage: 'chapter', bookId: recentBook.id, chapterId: recent.chapterId, verses: [] }, ''); window.history.pushState({ ...window.history.state, fhmBibleStage: 'verse', bookId: recentBook.id, chapterId: recent.chapterId, verses: [] }, ''); }}>{recent.label}</button>)}</div>}
    </section>}

    {book && !chapterId && <section className="bible-live-picker">
      <button className="bible-inline-back" aria-label="Back to Bible books" onClick={() => window.history.back()}><span aria-hidden="true">‹</span> Books</button>
      <p className="page-kicker">Choose a chapter</p><h1 dir="auto">{book.nameLong || book.name}</h1>
      <div className="bible-chapter-list">{(book.chapters || []).filter(item => item.number !== 'intro').map(item => <button key={item.id} onClick={() => openChapter(item.id)}><span>Chapter {item.number}</span><span aria-hidden="true">›</span></button>)}</div>
    </section>}

    {chapter && showVersePicker && <section className="bible-live-picker">
      <button className="bible-inline-back" aria-label={`Back to chapters in ${book?.nameLong || book?.name}`} onClick={() => window.history.back()}><span aria-hidden="true">‹</span> Chapters</button>
      <p className="page-kicker">Choose where to begin</p><h1>Select a verse</h1>
      <div className="bible-verse-grid">{Array.from({ length: chapter.verseCount }, (_, index) => index + 1).map(verse => <button key={verse} onClick={() => openVerse(verse)}>{verse}</button>)}</div>
    </section>}

    {chapter && !showVersePicker && <section className="bible-live-reader">
      <button className="bible-inline-back" aria-label="Back to verse selection" onClick={() => { if (editingVerses) requestCloseNote(); else window.history.back(); }}><span aria-hidden="true">‹</span> Verses</button>
      <p className="page-kicker">Tap any verse to select one or more</p><h1 dir="auto">{chapter.reference}</h1>
      {orderedSelection.length > 0 && <div className="bible-selection-toolbar" role="toolbar" aria-label={`${orderedSelection.length} ${orderedSelection.length === 1 ? 'verse' : 'verses'} selected`}>
        <div className="bible-selection-summary"><span className="bible-selection-check" aria-hidden="true">✓</span><div><strong>{orderedSelection.length} {orderedSelection.length === 1 ? 'verse' : 'verses'}</strong><small><bdi dir="auto">{chapter.reference}</bdi><span dir="ltr">:{selectedRange}</span></small></div></div>
        <div className="bible-selection-actions">
          <button type="button" aria-expanded={showHighlightColors} onClick={() => setShowHighlightColors(value => !value)}>Highlight</button>
          <button type="button" onClick={openNoteEditor}>Add note</button>
          <button type="button" onClick={() => copySelection()}>Copy</button>
          <button type="button" onClick={shareSelection}>Share</button>
          <button type="button" className="clear" onClick={() => clearSelection('Selection cancelled.')}>Cancel</button>
        </div>
        {showHighlightColors && <div className="bible-toolbar-colors" aria-label="Highlight selected verses">{COLORS.map(color => <button type="button" key={color || 'none'} className={`color-${color || 'none'}`} disabled={annotationBusy} onClick={() => void applyHighlight(color)} aria-label={COLOR_LABELS[color]} />)}</div>}
      </div>}
      <div ref={scriptureRef} className="eb-container bible-scripture" style={{ fontSize: `${fontSize}px` }} dir={version === 'AVD' ? 'rtl' : 'ltr'} aria-label={`${chapter.reference}. Tap verses to select more than one.`} onClick={chooseVerse} onKeyDown={chooseVerseWithKeyboard} dangerouslySetInnerHTML={{ __html: chapter.content }} />
      <div className="bible-copyright">{chapter.copyright}</div>
      {editingVerses && <aside className="bible-note-sheet" role="dialog" aria-modal="true" aria-labelledby="bible-note-title">
        <strong id="bible-note-title">{chapter.reference}:{formatVerseRanges(editingVerses)}</strong>
        <button className="bible-note-close" onClick={requestCloseNote} aria-label="Close private note">×</button>
        <p>One private note for {editingVerses.length} {editingVerses.length === 1 ? 'verse' : 'verses'}</p>
        <label className="sr-only" htmlFor="bible-private-note">Private note for selected verses</label>
        <textarea id="bible-private-note" value={noteDraft} onChange={event => setNoteDraft(event.target.value)} placeholder="Add a private note…" maxLength={2000} autoFocus />
        <div className="bible-note-actions"><button type="button" disabled={annotationBusy || !noteDraft.trim()} onClick={() => void saveNote()}>{annotationBusy ? 'Saving…' : 'Save note'}</button><button type="button" disabled={annotationBusy} onClick={requestCloseNote}>Close</button></div>
        <small>{signedIn ? 'Private to your signed-in account' : 'Saved only on this device until you sign in'}</small>
        {showDiscardPrompt && <div className="bible-note-discard" role="alertdialog" aria-labelledby="discard-note-title"><strong id="discard-note-title">Save your changes?</strong><p>This note has unsaved changes.</p><div><button type="button" disabled={annotationBusy || !noteDraft.trim()} onClick={() => void saveNote()}>Save</button><button type="button" onClick={() => { setEditingVerses(null); setShowDiscardPrompt(false); }}>Discard</button><button type="button" onClick={() => setShowDiscardPrompt(false)}>Cancel</button></div></div>}
      </aside>}
    </section>}
  </div>;
}
