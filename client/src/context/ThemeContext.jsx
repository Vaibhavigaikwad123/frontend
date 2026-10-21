import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved === 'true'; // Strict boolean check
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (darkMode) {
            root.classList.add('dark');
            document.body.classList.add('dark');
            root.setAttribute('data-theme', 'dark');
            localStorage.setItem('darkMode', 'true');
            console.log('✅ Theme applied: DARK ([data-theme="dark"] and .dark class added)');
        } else {
            root.classList.remove('dark');
            document.body.classList.remove('dark');
            root.setAttribute('data-theme', 'light');
            localStorage.setItem('darkMode', 'false');
            console.log('☀️ Theme applied: LIGHT ([data-theme="light"] set, .dark class removed)');
        }
    }, [darkMode]);

    const toggleDarkMode = () => {
        setDarkMode(prev => !prev);
    };

    return (
        <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};
