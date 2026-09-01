'use client';

import { AuthProvider } from '@/context/auth-context';
import { ThemeProvider } from '@/context/theme-context';
import { TermsEnforcement } from '@/components/auth/terms-gate';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <TermsEnforcement />
                {children}
            </AuthProvider>
        </ThemeProvider>
    );
}
