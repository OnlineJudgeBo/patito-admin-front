// Night mode: the "dark" class on <html> (Tailwind darkMode: "class"), remembered per browser.
const KEY = 'theme';

const read = () => {
    try {
        return localStorage.getItem(KEY);
    } catch {
        return null;
    }
};

export const isDark = () => document.documentElement.classList.contains('dark');

export const toggleTheme = () => {
    const dark = !isDark();
    document.documentElement.classList.toggle('dark', dark);
    try {
        localStorage.setItem(KEY, dark ? 'dark' : 'light');
    } catch {
        // private mode: the choice lasts until the page reloads
    }
    return dark;
};

document.documentElement.classList.toggle('dark', read() === 'dark');
