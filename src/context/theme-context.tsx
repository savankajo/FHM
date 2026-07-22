'use client';

import { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light' | 'warm' | 'blue';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const THEMES: Theme[] = ['dark', 'light', 'warm', 'blue'];
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(theme: Theme) {
    document.documentElement.classList.remove(...THEMES);
    document.documentElement.classList.add(theme);
    document.documentElement.style.colorScheme = theme === 'light' || theme === 'warm' ? 'light' : 'dark';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('fhm_theme') as Theme | null;
        const nextTheme = saved && THEMES.includes(saved) ? saved : 'dark';
        setThemeState(nextTheme);
        applyTheme(nextTheme);
    }, []);

    const setTheme = (nextTheme: Theme) => {
        setThemeState(nextTheme);
        applyTheme(nextTheme);
        localStorage.setItem('fhm_theme', nextTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
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
