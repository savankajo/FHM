'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const CHAT_PREFIX = '__FHM_CHAT__';
type Poll = { kind: 'poll'; question: string; options: Array<{ id: string; label: string; voterIds: string[] }> };
type Voice = { kind: 'voice'; audio: string; duration: number };

interface Message {
    id: string;
    text: string;
    userId: string;
    createdAt: string;
    user: { name: string };
}

export default function ChatRoom({ teamId, userId, userName }: { teamId: string, userId: string, userName: string }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(true);
    const [showPoll, setShowPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [recording, setRecording] = useState(false);
    const [recordingSeconds, setRecordingSeconds] = useState(0);
    const bottomRef = useRef<HTMLDivElement>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const durationRef = useRef(0);
    const directionFor = (text: string) => /[\u0600-\u06ff]/.test(text) ? 'rtl' : 'ltr';

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch(`/api/chat/${teamId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [fetchMessages]);

    useEffect(() => {
        // Scroll to bottom when messages change
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const optimisticMsg: Message = {
            id: Date.now().toString(),
            text: input,
            userId,
            createdAt: new Date().toISOString(),
            user: { name: userName }
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');
        // Scroll immediately for UX
        setTimeout(() => bottomRef.current?.scrollIntoView(), 100);

        try {
            await fetch(`/api/chat/${teamId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: optimisticMsg.text })
            });
            fetchMessages(); // Sync real ID
        } catch (e) {
            console.error('Failed to send', e);
        }
    };

    const sendPayload = async (payload: Poll | Voice) => {
        const text = CHAT_PREFIX + JSON.stringify(payload);
        const response = await fetch(`/api/chat/${teamId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text }) });
        if (!response.ok) alert((await response.json()).error || 'Could not send.');
        await fetchMessages();
    };

    const createPoll = async () => {
        const options = pollOptions.map(label => label.trim()).filter(Boolean);
        if (!pollQuestion.trim() || options.length < 2) return;
        await sendPayload({ kind: 'poll', question: pollQuestion.trim(), options: options.map((label, index) => ({ id: `${Date.now()}-${index}`, label, voterIds: [] })) });
        setPollQuestion(''); setPollOptions(['', '']); setShowPoll(false);
    };

    const vote = async (messageId: string, optionId: string) => {
        const response = await fetch(`/api/chat/${teamId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messageId, optionId }) });
        if (response.ok) fetchMessages();
    };

    const startRecording = async () => {
        if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') return alert('Voice recording is not supported on this device.');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const chunks: Blob[] = [];
            const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 64000 });
            recorderRef.current = recorder;
            durationRef.current = 0; setRecordingSeconds(0); setRecording(true);
            recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
            recorder.onstop = () => {
                stream.getTracks().forEach(track => track.stop());
                if (timerRef.current) clearInterval(timerRef.current);
                const duration = Math.max(1, durationRef.current);
                const reader = new FileReader();
                reader.onloadend = () => sendPayload({ kind: 'voice', audio: String(reader.result), duration });
                reader.readAsDataURL(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
                setRecording(false);
            };
            recorder.start();
            let elapsed = 0;
            timerRef.current = setInterval(() => { elapsed += 1; durationRef.current = elapsed; setRecordingSeconds(elapsed); if (elapsed >= 30) recorder.stop(); }, 1000);
        } catch { alert('Microphone permission is required to send a voice message.'); }
    };

    const parsePayload = (text: string): Poll | Voice | null => {
        if (!text.startsWith(CHAT_PREFIX)) return null;
        try { return JSON.parse(text.slice(CHAT_PREFIX.length)); } catch { return null; }
    };

    const moderate = async (action: 'report' | 'block', msg: Message) => {
        const prompt = action === 'report' ? 'Report this message to church administrators?' : `Block ${msg.user.name}? Their messages will be hidden.`;
        if (!confirm(prompt)) return;
        const res = await fetch('/api/chat/moderation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, messageId: msg.id, userId: msg.userId }) });
        if (res.ok) { alert(action === 'report' ? 'Message reported. Thank you.' : 'User blocked.'); fetchMessages(); }
        else alert('Unable to complete that action.');
    };

    return (
        <div className="chat-room">
            <div className="messages-area">
                {loading && <p className="text-center text-muted">Loading...</p>}
                {!loading && messages.length === 0 && (
                    <div className="chat-welcome"><div className="chat-welcome-icon" aria-hidden="true">✦</div><h2>Say hello to the team 👋</h2><p>This is a welcoming space to coordinate, encourage one another, and serve together.</p></div>
                )}

                {messages.map((msg, index) => {
                    const isMine = msg.userId === userId;
                    const showName = index === 0 || messages[index - 1].userId !== msg.userId;

                    const payload = parsePayload(msg.text);
                    return (
                        <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                            {!isMine && showName && <span className="sender-name"><span className="sender-avatar">{msg.user.name.slice(0, 1).toUpperCase()}</span>{msg.user.name}</span>}
                            <div className={`bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}${payload ? ' rich-message' : ''}`} dir={directionFor(msg.text)}>
                                {!payload && msg.text}
                                {payload?.kind === 'voice' && <div className="voice-message"><span>Voice message · {payload.duration}s</span><audio src={payload.audio} controls preload="metadata" /></div>}
                                {payload?.kind === 'poll' && <div className="poll-message"><strong>{payload.question}</strong>{payload.options.map(option => { const total = payload.options.reduce((sum, item) => sum + item.voterIds.length, 0); const selected = option.voterIds.includes(userId); return <button type="button" className={selected ? 'selected' : ''} onClick={() => vote(msg.id, option.id)} key={option.id}><span>{option.label}</span><small>{option.voterIds.length}{total ? ` · ${Math.round(option.voterIds.length / total * 100)}%` : ''}</small></button>; })}<small>{payload.options.reduce((sum, option) => sum + option.voterIds.length, 0)} votes</small></div>}
                            </div>
                            <span className="timestamp">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{isMine && ' · Sent'}
                            </span>
                            {!isMine && <span className="message-actions"><button onClick={() => moderate('report', msg)}>Report</button><button onClick={() => moderate('block', msg)}>Block user</button></span>}
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            {showPoll && <div className="poll-composer"><div className="poll-composer-head"><strong>New poll</strong><button type="button" onClick={() => setShowPoll(false)}>×</button></div><input value={pollQuestion} maxLength={160} onChange={event => setPollQuestion(event.target.value)} placeholder="Ask a question" />{pollOptions.map((option, index) => <input key={index} value={option} maxLength={80} onChange={event => setPollOptions(items => items.map((item, i) => i === index ? event.target.value : item))} placeholder={`Option ${index + 1}`} />)}<div className="poll-composer-actions">{pollOptions.length < 6 && <button type="button" onClick={() => setPollOptions(items => [...items, ''])}>+ Option</button>}<button type="button" className="create" disabled={!pollQuestion.trim() || pollOptions.filter(value => value.trim()).length < 2} onClick={createPoll}>Send poll</button></div></div>}

            <form onSubmit={handleSend} className="input-area">
                <button type="button" className="chat-tool" onClick={() => setShowPoll(value => !value)} aria-label="Create poll">▥</button>
                <input
                    className="chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                    dir={directionFor(input)}
                    aria-label="Message"
                />
                <button type="button" className={`chat-tool${recording ? ' recording' : ''}`} onClick={recording ? () => recorderRef.current?.stop() : startRecording} aria-label={recording ? 'Stop recording' : 'Record voice message'}>{recording ? `${recordingSeconds}s` : '🎙'}</button>
                <button className="chat-send" type="submit" disabled={!input.trim()} aria-label="Send message"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg></button>
            </form>

            <style jsx>{`
        .chat-room {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: var(--muted); 
          /* muted background for chat area makes bubbles pop */
        }
        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .chat-welcome { margin: auto; max-width: 310px; padding: 28px 20px; text-align: center; border: 1px solid var(--border); border-radius: 22px; background: var(--background); }
        .chat-welcome-icon { width: 60px; height: 60px; margin: 0 auto 14px; display: grid; place-items: center; border-radius: 20px; font-size: 28px; color: #d8bc62; background: rgba(139,105,20,.18); }
        .chat-welcome h2 { margin: 0 0 7px; font-size: 20px; }
        .chat-welcome p { margin: 0; color: var(--muted-foreground); font-size: 13px; line-height: 1.5; }
        .message-row {
          display: flex;
          flex-direction: column;
          max-width: 75%;
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
          padding: 0.75rem 1rem;
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
        .rich-message { width: min(300px, 72vw); }
        .voice-message { display: grid; gap: 7px; font-size: .72rem; }
        .voice-message audio { width: 100%; height: 38px; }
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
        .message-actions { display: flex; gap: .65rem; margin-top: 3px; }
        .message-actions button { border: 0; background: transparent; color: var(--muted-foreground); font-size: .68rem; text-decoration: underline; cursor: pointer; padding: 2px; }
        
        .input-area {
          padding: 0.75rem;
          background: var(--background);
          border-top: 1px solid var(--border);
          display: flex;
          gap: 0.5rem;
          padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
        }
        .chat-input {
          flex: 1;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid var(--border);
          font-size: 1rem;
        }
        .chat-input:focus {
          outline: none;
          border-color: var(--primary);
        }
        .chat-tool { min-width: 36px; height: 44px; font-size: 18px; cursor: pointer; }
        .chat-tool.recording { min-width: 48px; color: #ef4444; animation: pulse 1s infinite; }
        @keyframes pulse { 50% { opacity: .45; } }
        .chat-input[dir='rtl'] { text-align: right; }
        .chat-send { width: 44px; height: 44px; flex: 0 0 44px; display: grid; place-items: center; border: 0; border-radius: 50%; background: var(--primary); color: var(--primary-foreground); cursor: pointer; }
        .chat-send:disabled { opacity: .35; cursor: default; }
      `}</style>
        </div>
    );
}
