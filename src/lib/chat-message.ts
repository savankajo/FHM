export const CHAT_PREFIX = '__FHM_CHAT__';

export type ChatPoll = {
    kind: 'poll';
    question: string;
    options: Array<{ id: string; label: string; voterIds: string[] }>;
};

export type ChatVoice = {
    kind: 'voice';
    audio: string;
    duration: number;
};

export type ChatRichPayload = ChatPoll | ChatVoice;

export function isChatRichPayload(value: unknown): value is ChatRichPayload {
    if (!value || typeof value !== 'object') return false;
    const payload = value as Partial<ChatRichPayload>;
    return payload.kind === 'voice' || payload.kind === 'poll';
}

export function serializeChatPayload(payload: ChatRichPayload): string {
    return `${CHAT_PREFIX}${JSON.stringify(payload)}`;
}

export function parseChatPayload(text: string): ChatRichPayload | null {
    if (!text.startsWith(CHAT_PREFIX)) return null;
    try {
        const payload = JSON.parse(text.slice(CHAT_PREFIX.length));
        return isChatRichPayload(payload) ? payload : null;
    } catch {
        return null;
    }
}

export function resolveChatInput(input: { text?: unknown; payload?: unknown }):
    | { kind: 'empty' }
    | { kind: 'text'; text: string }
    | { kind: 'payload'; payload: ChatRichPayload; serialized: string } {
    if (isChatRichPayload(input.payload)) {
        return { kind: 'payload', payload: input.payload, serialized: serializeChatPayload(input.payload) };
    }
    if (typeof input.text !== 'string' || !input.text.trim()) return { kind: 'empty' };
    const richPayload = parseChatPayload(input.text);
    return richPayload
        ? { kind: 'payload', payload: richPayload, serialized: serializeChatPayload(richPayload) }
        : { kind: 'text', text: input.text.trim() };
}

export function mergeChatMessages<T extends { id: string; createdAt: string | Date }>(
    current: T[],
    incoming: T[],
): T[] {
    const messages = new Map(current.map(message => [message.id, message]));
    for (const message of incoming) messages.set(message.id, message);
    return Array.from(messages.values()).sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
}
