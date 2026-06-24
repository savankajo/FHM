'use client';

import { createContext, useContext, useEffect } from 'react';

type Theme = 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('fhm_theme', 'dark');
    }, []);

    const toggleTheme = () => {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
        localStorage.setItem('fhm_theme', 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
