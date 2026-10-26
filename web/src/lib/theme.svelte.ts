export type Theme = 'light' | 'dark';

const KEY = 'locker-panel-theme';

function initialTheme(): Theme {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // Storage can be blocked (private mode); fall back to the system setting.
  }
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = $state({ current: initialTheme() });

export function toggleTheme(): void {
  theme.current = theme.current === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(KEY, theme.current);
  } catch {
    // Not critical: the choice just won't survive a reload.
  }
}
