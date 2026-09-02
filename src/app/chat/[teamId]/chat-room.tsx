'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { REPORT_REASONS } from '@/lib/safety-constants';
import { ChatPoll, ChatVoice, mergeChatMessages, parseChatPayload } from '@/lib/chat-message';

interface Message {
    id: string;
    text: string;
    userId: string;
    createdAt: string;
    user: { name: string };
    moderationStatus: 'PENDING' | 'PUBLISHED' | 'REMOVED';
    contentType: 'TEXT' | 'VOICE' | 'POLL';
}

export default function ChatRoom({ teamId, userId, userName }: { teamId: string, userId: string, userName: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [showPoll, setShowPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [recording, setRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const [recordedVoice, setRecordedVoice] = useState<ChatVoice | null>(null);
    const [voiceStatus, setVoiceStatus] = useState('');
    const [voiceSending, setVoiceSending] = useState(false);
    const [sending, setSending] = useState(false);
    const [composerError, setComposerError] = useState('');
    const [safetyNotice, setSafetyNotice] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [moderationTarget, setModerationTarget] = useState<{ action: 'report' | 'block'; message: Message } | null>(null);
    const [moderationReason, setModerationReason] = useState<string>(REPORT_REASONS[0]);
    const [moderationDetails, setModerationDetails] = useState('');
    const [moderationBusy, setModerationBusy] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const textSendLockRef = useRef(false);
    const payloadSendLockRef = useRef(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const durationRef = useRef(0);
    const directionFor = (text: string) => /[\u0600-\u06ff]/.test(text) ? 'rtl' : 'ltr';

    const fetchMessages = useCallback(async (showError = false) => {
        try {
            const res = await fetch(`/api/chat/${teamId}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Could not load team messages.');
            setMessages(data.messages);
            setLoadError('');
        } catch (error) {
            console.error(error);
            if (showError) setLoadError(error instanceof Error ? error.message : 'Could not load team messages.');
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        void fetchMessages(true);
        const interval = setInterval(() => void fetchMessages(false), 3000);
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        // Scroll to bottom when messages change
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text || textSendLockRef.current) return;
        textSendLockRef.current = true;
        setSending(true); setComposerError(''); setSafetyNotice('');
        try {
            const response = await fetch(`/api/chat/${teamId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not send this message.');
            setInput('');
            setMessages(previous => mergeChatMessages(previous, [data.message]));
            setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
        } catch (e) {
            setComposerError(e instanceof Error ? e.message : 'Could not send this message.');
        } finally { textSendLockRef.current = false; setSending(false); }
    };

    const sendPayload = async (payload: ChatPoll | ChatVoice) => {
        if (payloadSendLockRef.current) throw new Error('This message is already sending.');
        payloadSendLockRef.current = true;
        try {
            const response = await fetch(`/api/chat/${teamId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ payload }) });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Could not send.');
            setMessages(previous => mergeChatMessages(previous, [data.message]));
            setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
            return data as { message: Message; pendingModeration?: boolean };
        } finally {
            payloadSendLockRef.current = false;
        }
    };

    const createPoll = async () => {
        const options = pollOptions.map(label => label.trim()).filter(Boolean);
        if (!pollQuestion.trim() || options.length < 2) return;
        try {
            await sendPayload({ kind: 'poll', question: pollQuestion.trim(), options: options.map((label, index) => ({ id: `${Date.now()}-${index}`, label, voterIds: [] })) });
            setPollQuestion(''); setPollOptions(['', '']); setShowPoll(false);
        } catch (error) { alert(error instanceof Error ? error.message : 'Could not send poll.'); }
    };

    const vote = async (messageId: string, optionId: string) => {
        const response = await fetch(`/api/chat/${teamId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, optionId }) });
        if (response.ok) fetchMessages();
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return alert('Voice recording is not supported on this device.');
        try {
            setVoiceStatus('');
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const chunks: Blob[] = [];
            const preferredTypes = ['audio/mp4;codecs=mp4a.40.2', 'audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
            const mimeType = preferredTypes.find(type => MediaRecorder.isTypeSupported(type));
            const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 64000, ...(mimeType ? { mimeType } : {}) });
            recorderRef.current = recorder;
            durationRef.current = 0; setRecordingSeconds(0); setRecording(true);
            recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
            recorder.onerror = () => {
                setVoiceStatus('Recording failed. Please try again.');
                setRecording(false);
                stream.getTracks().forEach(track => track.stop());
            };
            recorder.onstop = async () => {
                stream.getTracks().forEach(track => track.stop());
                if (timerRef.current) clearInterval(timerRef.current);
                const duration = Math.max(1, durationRef.current);
                if (!chunks.length) { setVoiceStatus('No audio was recorded. Please try again.'); setRecording(false); return; }
                const reader = new FileReader();
                reader.onloadend = () => {
                    setRecordedVoice({ kind: 'voice', audio: String(reader.result), duration });
                    setVoiceStatus('Recording ready. Preview it, then send or cancel.');
                };
                const recordedMimeType = (recorder.mimeType || mimeType || chunks[0]?.type || 'audio/mp4').split(';', 1)[0].trim().toLowerCase();
                reader.readAsDataURL(new Blob(chunks, { type: recordedMimeType }));
                setRecording(false);
            };
            recorder.start();
            let elapsed = 0;
            timerRef.current = setInterval(() => { elapsed += 1; durationRef.current = elapsed; setRecordingSeconds(elapsed); if (elapsed >= 30) recorder.stop(); }, 1000);
        } catch (error) {
            const denied = error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError');
            setVoiceStatus(denied ? 'Microphone access is off. Enable it in your device settings and try again.' : 'Could not start voice recording on this device.');
        }
    };

    const sendRecordedVoice = async () => {
        if (!recordedVoice || voiceSending) return;
        setVoiceSending(true);
        setComposerError('');
        setVoiceStatus('Sending voice message…');
        try {
            const result = await sendPayload(recordedVoice);
            setRecordedVoice(null);
            setVoiceStatus(result.pendingModeration ? 'Voice message submitted for safety review. It will appear to the team after approval.' : 'Voice message sent.');
        } catch (error) {
            setComposerError(error instanceof Error ? error.message : 'Could not send voice message.');
            setVoiceStatus('Voice message was not sent. Your recording is still here so you can retry.');
        } finally {
            setVoiceSending(false);
        }
    };

    const openModeration = (action: 'report' | 'block', message: Message) => {
        setOpenMenuId(null);
        setModerationReason(REPORT_REASONS[0]);
        setModerationDetails('');
        setModerationTarget({ action, message });
    };

    const submitModeration = async () => {
        if (!moderationTarget || moderationBusy) return;
        setModerationBusy(true); setSafetyNotice('');
        try {
            const response = await fetch('/api/chat/moderation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: moderationTarget.action, messageId: moderationTarget.message.id, userId: moderationTarget.message.userId, reason: moderationReason, details: moderationDetails }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Unable to complete that safety action.');
            if (moderationTarget.action === 'block') {
                setMessages(current => current.filter(message => message.userId !== moderationTarget.message.userId));
            }
            setSafetyNotice(data.message);
            setModerationTarget(null);
            await fetchMessages();
        } catch (error) {
            setSafetyNotice(error instanceof Error ? error.message : 'Unable to complete that safety action.');
        } finally { setModerationBusy(false); }
    };

    return (
        <div className="chat-room">
            <div className="messages-area">
                {loading && <p className="text-center text-muted">Loading...</p>}
                {loadError && <div className="chat-load-error" role="alert"><span>{loadError}</span><button type="button" onClick={() => void fetchMessages(true)}>Try again</button></div>}
                {!loading && !loadError && messages.length === 0 && (
                    <div className="chat-welcome"><div className="chat-welcome-icon" aria-hidden="true">✦</div><h2>Say hello to the team 👋</h2><p>This is a welcoming space to coordinate, encourage one another, and serve together.</p></div>
                )}

                {messages.map((msg, index) => {
                    const isMine = msg.userId === userId;
                    const showName = index === 0 || messages[index - 1].userId !== msg.userId;

                    const payload = parseChatPayload(msg.text);
                    return (
                        <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                            {!isMine && showName && <span className="sender-name"><span className="sender-avatar">{msg.user.name.slice(0, 1).toUpperCase()}</span>{msg.user.name}</span>}
                            <div className={`bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}${payload ? ' rich-message' : ''}${msg.moderationStatus === 'PENDING' ? ' pending-review' : ''}`} dir={directionFor(msg.text)}>
                                {!payload && msg.text}
                                {payload?.kind === 'voice' && <div className="voice-message"><span>Voice message · {payload.duration}s</span><audio src={payload.audio} controls preload="metadata" /></div>}
                                {payload?.kind === 'poll' && <div className="poll-message"><strong>{payload.question}</strong>{payload.options.map(option => { const total = payload.options.reduce((sum, item) => sum + item.voterIds.length, 0); const selected = option.voterIds.includes(userId); return <button type="button" className={selected ? 'selected' : ''} onClick={() => vote(msg.id, option.id)} key={option.id}><span>{option.label}</span><small>{option.voterIds.length}{total ? ` · ${Math.round(option.voterIds.length / total * 100)}%` : ''}</small></button>; })}<small>{payload.options.reduce((sum, option) => sum + option.voterIds.length, 0)} votes</small></div>}
                                {msg.moderationStatus === 'PENDING' && <span className="pending-label">Pending safety review · only you can see this</span>}
                            </div>
                            <span className="timestamp">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{isMine && ' · Sent'}
                            </span>
                            {!isMine && <div className="message-actions"><button type="button" aria-label={`Safety options for ${msg.user.name}'s message`} aria-expanded={openMenuId === msg.id} onClick={() => setOpenMenuId(current => current === msg.id ? null : msg.id)}>•••</button>{openMenuId === msg.id && <div className="message-action-menu"><button type="button" onClick={() => openModeration('report', msg)}>Report message</button><button type="button" onClick={() => openModeration('block', msg)}>Block user</button></div>}</div>}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {showPoll && <div className="poll-composer"><div className="poll-composer-head"><strong>New poll</strong><button type="button" onClick={() => setShowPoll(false)} aria-label="Close poll composer">×</button></div><input value={pollQuestion} maxLength={160} onChange={event => setPollQuestion(event.target.value)} placeholder="Ask a question" aria-label="Poll question" />{pollOptions.map((option, index) => <input key={index} value={option} maxLength={80} onChange={event => setPollOptions(items => items.map((item, i) => i === index ? event.target.value : item))} placeholder={`Option ${index + 1}`} aria-label={`Poll option ${index + 1}`} />)}<div className="poll-composer-actions">{pollOptions.length < 6 && <button type="button" onClick={() => setPollOptions(items => [...items, ''])}>+ Option</button>}<button type="button" className="create" disabled={!pollQuestion.trim() || pollOptions.filter(value => value.trim()).length < 2} onClick={createPoll}>Send poll</button></div></div>}

            {safetyNotice && <div className="safety-notice" role="status">{safetyNotice}</div>}
            {composerError && <div className="composer-error" role="alert">{composerError}</div>}
            {recordedVoice && <div className="voice-preview" aria-label="Voice recording preview">
                <div className="voice-preview-copy"><strong>Voice recording · {recordedVoice.duration}s</strong><span>Listen before sending. A failed send keeps this recording available.</span></div>
                <audio src={recordedVoice.audio} controls preload="metadata" />
                <div className="voice-preview-actions">
                    <button type="button" disabled={voiceSending} onClick={() => { setRecordedVoice(null); setVoiceStatus('Recording cancelled.'); }}>Cancel</button>
                    <button type="button" className="voice-send" disabled={voiceSending} onClick={sendRecordedVoice}>{voiceSending ? 'Sending…' : composerError ? 'Retry voice' : 'Send voice'}</button>
                </div>
            </div>}
            <form onSubmit={handleSend} className="input-area">
                <button type="button" className="chat-tool" onClick={() => setShowPoll(value => !value)} aria-label="Create poll">▥</button>
                <input
                    className="chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    dir={directionFor(input)}
                    aria-label="Message"
                    maxLength={1000}
                    disabled={sending || recording}
                />
                <button type="button" className={`chat-tool${recording ? ' recording' : ''}`} disabled={voiceSending} onClick={recording ? () => recorderRef.current?.stop() : startRecording} aria-label={recording ? 'Stop recording' : recordedVoice ? 'Record a new voice message' : 'Record voice message'}>{recording ? `${recordingSeconds}s` : '🎙'}</button>
                <button className="chat-send" type="submit" disabled={!input.trim() || sending} aria-label={sending ? 'Sending message' : 'Send message'}>{sending ? <span className="chat-send-progress" aria-hidden="true">…</span> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>}</button>
            </form>
            {voiceStatus && <div className="voice-status" role="status">{voiceStatus}</div>}

            {moderationTarget && <div className="moderation-dialog-backdrop" role="dialog" aria-modal="true" aria-labelledby="moderation-dialog-title"><div className="moderation-dialog"><h2 id="moderation-dialog-title">{moderationTarget.action === 'report' ? 'Report message' : `Block ${moderationTarget.message.user.name}`}</h2><p>{moderationTarget.action === 'report' ? 'Your identity is protected from the reported user.' : 'Their content will disappear immediately. Blocking also creates a safety report for moderator review.'}</p><label>Reason<select value={moderationReason} onChange={event => setModerationReason(event.target.value)}>{REPORT_REASONS.map(reason => <option value={reason} key={reason}>{reason}</option>)}</select></label><label>Additional details (optional)<textarea value={moderationDetails} maxLength={1000} onChange={event => setModerationDetails(event.target.value)} placeholder="Share any context that will help the moderation team." /></label><div className="moderation-dialog-actions"><button type="button" className="btn btn-primary" disabled={moderationBusy} onClick={submitModeration}>{moderationBusy ? 'Submitting…' : moderationTarget.action === 'report' ? 'Submit report' : 'Block and report'}</button><button type="button" className="btn" disabled={moderationBusy} onClick={() => setModerationTarget(null)}>Cancel</button></div></div></div>}

            <style jsx>{`
        .chat-room {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--muted); 
          /* muted background for chat area makes bubbles pop */
        }
        .messages-area {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          padding: clamp(10px, 3vw, 16px);
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .chat-welcome { margin: auto; max-width: 310px; padding: 28px 20px; text-align: center; border: 1px solid var(--border); border-radius: 22px; background: var(--background); }
        .chat-welcome-icon { width: 60px; height: 60px; margin: 0 auto 14px; display: grid; place-items: center; border-radius: 20px; font-size: 28px; color: #d8bc62; background: rgba(139,105,20,.18); }
        .chat-welcome h2 { margin: 0 0 7px; font-size: 20px; }
        .chat-welcome p { margin: 0; color: var(--muted-foreground); font-size: 13px; line-height: 1.5; }
        .chat-load-error { margin: auto; max-width: 340px; display: grid; gap: 12px; padding: 18px; border: 1px solid color-mix(in srgb, #dc2626 40%, var(--border)); border-radius: 16px; background: var(--background); text-align: center; }
        .chat-load-error button { min-height: 44px; border: 0; border-radius: 12px; background: var(--primary); color: var(--primary-foreground); font-weight: 800; }
        .message-row {
          display: flex;
          flex-direction: column;
          max-width: min(78%, 520px);
        }
        .message-row.mine {
          align-self: flex-end;
          align-items: flex-end;
        }
        .message-row.theirs {
          align-self: flex-start;
          align-items: flex-start;
        }
        .sender-name {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          margin-bottom: 2px;
          margin-left: 4px;
        }
        .sender-avatar { width: 22px; height: 22px; display: inline-grid; place-items: center; margin-right: 6px; border-radius: 50%; background: var(--primary); color: var(--primary-foreground); font-size: 10px; font-weight: 800; }
        .bubble {
          padding: 10px 13px;
          border-radius: 1rem;
          font-size: 0.95rem;
          line-height: 1.4;
          word-break: break-word;
        }
        .bubble-mine {
          background-color: var(--primary);
          color: var(--primary-foreground);
          border-bottom-right-radius: 2px;
        }
        .bubble-theirs {
          background-color: var(--background);
          border: 1px solid var(--border);
          border-bottom-left-radius: 2px;
        }
        .timestamp {
          font-size: 0.65rem;
          color: var(--muted-foreground);
          margin-top: 2px;
          opacity: 0.7;
        }
        .rich-message { width: min(280px, calc(100vw - 76px)); max-width: 100%; }
        .voice-message { display: grid; gap: 7px; font-size: .72rem; }
        .voice-message audio { width: 100%; height: 38px; }
        .pending-review { border-style: dashed; opacity: .82; }
        .pending-label { display: block; margin-top: 8px; font-size: .68rem; font-weight: 700; opacity: .78; }
        .poll-message { display: grid; gap: 7px; }
        .poll-message > strong { margin-bottom: 3px; }
        .poll-message button { display: flex; justify-content: space-between; gap: 8px; width: 100%; padding: 9px 10px; border: 1px solid var(--border); border-radius: 10px; background: var(--background); color: var(--foreground); text-align: left; }
        .poll-message button.selected { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
        .poll-message small { opacity: .75; }
        .poll-composer { display: grid; gap: 8px; padding: 12px; border-top: 1px solid var(--border); background: var(--background); }
        .poll-composer-head, .poll-composer-actions { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .poll-composer-head button, .poll-composer-actions button, .chat-tool { border: 0; background: transparent; color: var(--primary); font-weight: 800; }
        .poll-composer input { min-height: 40px; padding: 8px 11px; border: 1px solid var(--border); border-radius: 10px; background: var(--background); color: var(--foreground); }
        .poll-composer-actions .create { padding: 8px 12px; border-radius: 9px; background: var(--primary); color: var(--primary-foreground); }
        .message-actions { position: relative; display: flex; gap: .65rem; margin-top: 3px; }
        .message-actions > button { min-width: 44px; min-height: 30px; border: 0; background: transparent; color: var(--muted-foreground); font-size: .85rem; cursor: pointer; }
        .message-action-menu { position: absolute; left: 0; bottom: 30px; z-index: 4; width: 180px; overflow: hidden; border: 1px solid var(--border); border-radius: 12px; background: var(--background); box-shadow: var(--shadow-lg); }
        .message-action-menu button { width: 100%; min-height: 44px; padding: 9px 12px; border: 0; border-bottom: 1px solid var(--border); background: transparent; color: var(--foreground); text-align: left; cursor: pointer; }
        .message-action-menu button:last-child { border-bottom: 0; color: #dc2626; }
        .safety-notice, .composer-error { padding: 9px 14px; border-top: 1px solid var(--border); font-size: .78rem; text-align: center; }
        .safety-notice { background: color-mix(in srgb, #16a34a 10%, var(--background)); color: var(--foreground); }
        .composer-error { background: color-mix(in srgb, #dc2626 10%, var(--background)); color: #ef4444; }
        .moderation-dialog-backdrop { position: fixed; inset: 0; z-index: 1001; display: grid; place-items: center; padding: 18px; background: rgba(0,0,0,.72); backdrop-filter: blur(8px); }
        .moderation-dialog { width: min(100%, 480px); max-height: calc(100dvh - 36px); overflow-y: auto; display: grid; gap: 14px; padding: 22px; border: 1px solid var(--border); border-radius: 20px; background: var(--background); color: var(--foreground); box-shadow: var(--shadow-xl); }
        .moderation-dialog h2, .moderation-dialog p { margin: 0; }
        .moderation-dialog p { color: var(--muted-foreground); line-height: 1.5; }
        .moderation-dialog label { display: grid; gap: 6px; font-size: .82rem; font-weight: 700; }
        .moderation-dialog select, .moderation-dialog textarea { width: 100%; min-height: 46px; padding: 10px 12px; border: 1px solid var(--border); border-radius: 12px; background: var(--background); color: var(--foreground); font: inherit; }
        .moderation-dialog textarea { min-height: 96px; resize: vertical; }
        .moderation-dialog-actions { display: flex; flex-wrap: wrap; gap: 9px; }
        .voice-preview { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px 14px; align-items: center; padding: 12px 14px; border-top: 1px solid var(--border); background: color-mix(in srgb, var(--primary) 6%, var(--background)); }
        .voice-preview-copy { min-width: 0; display: grid; gap: 3px; }
        .voice-preview-copy span { color: var(--muted-foreground); font-size: .72rem; line-height: 1.4; }
        .voice-preview audio { grid-column: 1 / -1; width: 100%; height: 40px; }
        .voice-preview-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 8px; }
        .voice-preview-actions button { min-height: 44px; padding: 8px 14px; border: 1px solid var(--border); border-radius: 12px; background: var(--background); color: var(--foreground); font-weight: 800; }
        .voice-preview-actions .voice-send { border-color: var(--primary); background: var(--primary); color: var(--primary-foreground); }
        .voice-preview-actions button:disabled { opacity: .55; }
        
        .input-area {
          flex: 0 0 auto;
          padding: 10px clamp(8px, 2.5vw, 14px);
          background: var(--background);
          border-top: 1px solid var(--border);
          display: flex;
          gap: clamp(4px, 1.5vw, 8px);
          padding-bottom: calc(10px + env(safe-area-inset-bottom));
        }
        .chat-input {
          flex: 1;
          min-width: 0;
          height: 44px;
          padding: 8px 13px;
          border-radius: 20px;
          border: 1px solid var(--border);
          font-size: 1rem;
        }
        .chat-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .chat-tool { width: 36px; min-width: 36px; height: 44px; padding: 0; font-size: 18px; cursor: pointer; }
        .chat-tool.recording { min-width: 48px; color: #ef4444; animation: pulse 1s infinite; }
        @keyframes pulse { 50% { opacity: .45; } }
        .chat-input[dir='rtl'] { text-align: right; }
        .chat-send { width: 44px; height: 44px; flex: 0 0 44px; display: grid; place-items: center; border: 0; border-radius: 50%; background: var(--primary); color: var(--primary-foreground); cursor: pointer; }
        .chat-send:disabled { opacity: .35; cursor: default; }
        .chat-send-progress { font-size: 1.15rem; font-weight: 900; animation: sendPulse .8s ease-in-out infinite alternate; }
        @keyframes sendPulse { to { transform: translateY(-2px); opacity: .55; } }
        .voice-status { padding: 7px 14px calc(7px + env(safe-area-inset-bottom)); border-top: 1px solid var(--border); background: var(--background); color: var(--muted-foreground); font-size: 12px; text-align: center; }
        @media (max-width: 380px) {
          .message-row { max-width: 86%; }
          .chat-tool { width: 32px; min-width: 32px; }
          .chat-send { width: 42px; height: 42px; flex-basis: 42px; }
          .voice-preview { padding-inline: 10px; }
        }
      `}</style>
        </div>
    );
}
