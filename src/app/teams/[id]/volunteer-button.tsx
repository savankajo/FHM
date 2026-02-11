'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

interface VolunteerButtonProps {
    serviceId: string;
    isVolunteering: boolean;
    disabled: boolean;
}

export default function VolunteerButton({ serviceId, isVolunteering, disabled }: VolunteerButtonProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleVolunteer = async () => {
        setLoading(true);
        try {
            // Toggle logic would go here, but for now we only have 'volunteer' route (no 'unvolunteer' yet)
            // Assuming naive implementation: POST to volunteer.
            if (isVolunteering) return; // Prevent for now

            const res = await fetch('/api/services/volunteer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ serviceId }),
            });
            if (res.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (isVolunteering) {
        return <Button size="sm" variant="outline" className="bg-green-50 border-green-500 text-green-700">✓ Going</Button>;
    }

    return (
        <Button size="sm" onClick={handleVolunteer} disabled={loading || disabled}>
            {loading ? '...' : disabled ? 'Full' : 'Volunteer'}
        </Button>
    );
}
