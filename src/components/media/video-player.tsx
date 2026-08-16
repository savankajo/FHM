'use client';
import { useState } from 'react';

export default function VideoPlayer({ provider, videoId, title, date, thumbnailUrl }: { provider: 'YOUTUBE' | 'VIMEO'; videoId: string; title: string; date?: string; thumbnailUrl?: string | null }) {
  const [playing, setPlaying] = useState(false);
  const embed = provider === 'VIMEO' ? `https://player.vimeo.com/video/${videoId}?autoplay=0&title=0&byline=0` : `https://www.youtube-nocookie.com/embed/${videoId}?playsinline=1&rel=0&autoplay=0&enablejsapi=1`;
  const external = provider === 'VIMEO' ? `https://vimeo.com/${videoId}` : `https://www.youtube.com/watch?v=${videoId}`;
  return <section className="native-video-card" aria-label={`${title} video player`}>
    <div className="native-video-frame">{playing ? <iframe src={embed} title={title} allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/> : <button className="video-preview" onClick={() => setPlaying(true)} aria-label={`Play ${title}`} style={thumbnailUrl ? {backgroundImage:`linear-gradient(0deg,rgba(0,0,0,.75),rgba(0,0,0,.1)),url(${thumbnailUrl})`} : undefined}><span className="video-play">▶</span><span className="video-overlay"><strong>{title}</strong>{date && <small>{date}</small>}</span></button>}</div>
    <a href={external} target="_blank" rel="noreferrer" className="video-external">Open in {provider === 'VIMEO' ? 'Vimeo' : 'YouTube'}</a>
  </section>;
}
