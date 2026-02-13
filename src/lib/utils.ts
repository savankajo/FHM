import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

export function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;

    let embedUrl: string | null = null;

    // Handle standard watch?v= format
    const watchMatch = url.match(/[?&]v=([^&]+)/);
    if (watchMatch) {
        embedUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;
    }
    // Handle short youtu.be/ format
    else if (url.match(/youtu\.be\/([^?&]+)/)) {
        const shortMatch = url.match(/youtu\.be\/([^?&]+)/);
        embedUrl = `https://www.youtube.com/embed/${shortMatch![1]}`;
    }
    // Handle embed/ format
    else if (url.includes('/embed/')) {
        embedUrl = url;
    }

    if (embedUrl) {
        // Ensure protocol
        if (embedUrl.startsWith('//')) return `https:${embedUrl}`;
        if (!embedUrl.startsWith('http')) return `https://${embedUrl}`;
        return embedUrl;
    }

    return null;
}

export function ensureAbsoluteUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;
    const trimmed = url.trim();
    if (!trimmed) return undefined;

    // Handle protocol-relative URLs
    if (trimmed.startsWith('//')) return `https:${trimmed}`;

    // Handle existing protocols
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;

    // Default to https
    return `https://${trimmed}`;
}
