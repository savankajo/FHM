'use client';

import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { TermsEnforcement } from '@/components/auth/terms-gate';
import { PushRegistration } from '@/components/push-registration';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TermsEnforcement />
                <PushRegistration />
                {children}
            </AuthProvider>
        </ThemeProvider>
    );
}
