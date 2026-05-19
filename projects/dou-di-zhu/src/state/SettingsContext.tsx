import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Difficulty } from '../core/ai';

export type Theme = 'classic' | 'dark' | 'rosewood';

export interface Settings {
  difficulty: Difficulty;
  theme: Theme;
  soundEnabled: boolean;
}

interface SettingsContextValue {
  settings: Settings;
  update: (patch: Partial<Settings>) => void;
}

const STORAGE_KEY = 'dou-di-zhu:settings';
const DEFAULT_SETTINGS: Settings = {
  difficulty: 'normal',
  theme: 'classic',
  soundEnabled: true,
};

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(s: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* ignore quota errors */
  }
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(loadSettings);

  useEffect(() => {
    saveSettings(settings);
    document.body.dataset.theme = settings.theme;
  }, [settings]);

  const update = (patch: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...patch }));
  };

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside SettingsProvider');
  return ctx;
}
