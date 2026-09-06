'use client';

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { registerPushIfAlreadyAllowed } from '@/lib/push-client';

export function PushRegistration() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    void registerPushIfAlreadyAllowed().catch(error => console.error('Push setup failed:', error));
  }, [user]);

  return null;
}
