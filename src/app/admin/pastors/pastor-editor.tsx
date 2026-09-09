'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { pastorInitials, type Pastor } from '@/data/pastors';

type SaveState = { kind: 'idle' | 'saving' | 'success' | 'error'; message: string };

function PastorPhotoPreview({ pastor }: { pastor: Pastor }) {
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => setImageFailed(false), [pastor.imageUrl]);

  return (
    <div className="pastor-admin-preview" aria-label={`${pastor.name} photo preview`}>
      {pastor.imageUrl && !imageFailed ? (
        // Admin-provided URLs are previewed without Next.js host restrictions.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={pastor.imageUrl} alt={`${pastor.name} preview`} onError={() => setImageFailed(true)} />
      ) : <span aria-hidden="true">{pastorInitials(pastor.name)}</span>}
    </div>
  );
}

export default function PastorEditor({ pastors: initialPastors }: { pastors: readonly Pastor[] }) {
  const router = useRouter();
  const [pastors, setPastors] = useState(initialPastors.map(pastor => ({ ...pastor })));
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  function updatePastor(id: string, field: 'name' | 'role' | 'imageUrl', value: string) {
    setPastors(current => current.map(pastor => pastor.id === id ? { ...pastor, [field]: value } : pastor));
    setSaveStates(current => ({ ...current, [id]: { kind: 'idle', message: '' } }));
  }

  async function savePastor(pastor: Pastor) {
    setSaveStates(current => ({ ...current, [pastor.id]: { kind: 'saving', message: 'Saving…' } }));
    try {
      const response = await fetch('/api/admin/pastors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pastor.id, name: pastor.name, role: pastor.role, imageUrl: pastor.imageUrl || '' }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Could not save this profile.');
      setPastors(current => current.map(item => item.id === pastor.id ? result.pastor : item));
      setSaveStates(current => ({ ...current, [pastor.id]: { kind: 'success', message: 'Saved. The homepage has been updated.' } }));
      router.refresh();
    } catch (error) {
      setSaveStates(current => ({ ...current, [pastor.id]: { kind: 'error', message: error instanceof Error ? error.message : 'Could not save this profile.' } }));
    }
  }

  return (
    <div className="pastor-admin-grid">
      {pastors.map(pastor => {
        const state = saveStates[pastor.id] || { kind: 'idle', message: '' };
        return (
          <section className="pastor-admin-card" key={pastor.id}>
            <PastorPhotoPreview pastor={pastor} />
            <div className="pastor-admin-fields">
              <Input label="Name" value={pastor.name} maxLength={100} required onChange={event => updatePastor(pastor.id, 'name', event.target.value)} />
              <Input label="Role" value={pastor.role} maxLength={100} required onChange={event => updatePastor(pastor.id, 'role', event.target.value)} />
              <Input label="Photo URL" type="url" inputMode="url" placeholder="https://example.com/pastor-photo.jpg" value={pastor.imageUrl || ''} onChange={event => updatePastor(pastor.id, 'imageUrl', event.target.value)} />
              <p className="pastor-admin-status" role="status" style={state.kind === 'error' ? { color: '#b42318' } : undefined}>{state.message}</p>
              <Button type="button" fullWidth disabled={state.kind === 'saving'} onClick={() => void savePastor(pastor)}>{state.kind === 'saving' ? 'Saving…' : `Save ${pastor.name}`}</Button>
            </div>
          </section>
        );
      })}
    </div>
  );
}
