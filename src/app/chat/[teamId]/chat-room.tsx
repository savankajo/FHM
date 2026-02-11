'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    const bottomRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
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
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [teamId]);

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

    return (
        <div className="chat-room">
            <div className="messages-area">
                {loading && <p className="text-center text-muted">Loading...</p>}
                {!loading && messages.length === 0 && (
                    <p className="text-center text-muted mt-8">No messages yet. Start the conversation!</p>
                )}

                {messages.map((msg, index) => {
                    const isMine = msg.userId === userId;
                    const showName = index === 0 || messages[index - 1].userId !== msg.userId;

                    return (
                        <div key={msg.id} className={`message-row ${isMine ? 'mine' : 'theirs'}`}>
                            {!isMine && showName && <span className="sender-name">{msg.user.name}</span>}
                            <div className={`bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                                {msg.text}
                            </div>
                            <span className="timestamp">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className="input-area">
                <input
                    className="chat-input"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Type a message..."
                />
                <Button type="submit" disabled={!input.trim()}>Send</Button>
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
      `}</style>
        </div>
    );
}
