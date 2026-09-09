'use client';

import { useEffect, useState } from 'react';
import type { Pastor } from '@/data/pastors';

function PastorPortrait({ pastor }: { pastor: Pastor }) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(pastor.imageUrl) && !imageFailed;

  useEffect(() => setImageFailed(false), [pastor.imageUrl]);

  return (
    <div className="pastor-portrait" role="img" aria-label={`${pastor.name} portrait`}>
      {showImage ? (
        // Admin-managed remote photos intentionally use the browser image loader.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={pastor.imageUrl || ''}
          alt={`${pastor.name} portrait`}
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="pastor-initials" aria-hidden="true">{pastor.initials}</span>
      )}
    </div>
  );
}

export default function PastorSection({ pastors }: { pastors: readonly Pastor[] }) {
  return (
    <section className="pastor-section" aria-labelledby="pastor-section-title">
      <div className="section-header pastor-section-header">
        <div><span className="pastor-section-kicker">Our church family</span><h2 id="pastor-section-title" className="section-title">Meet Our Pastors</h2></div>
      </div>
      <div className="pastor-grid">
        {pastors.map(pastor => (
          <article className="pastor-card" key={pastor.id}>
            <PastorPortrait pastor={pastor} />
            <div className="pastor-card-copy"><p>{pastor.role}</p><h3>{pastor.name}</h3></div>
          </article>
        ))}
      </div>
    </section>
  );
}
