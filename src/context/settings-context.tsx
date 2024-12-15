import React, { createContext, useContext, useEffect, useState } from 'react';

interface SubtitleSettings {
  fontSize: number;
  fontColor: string;
  showSubtitles: boolean;
  showSubtitlesList: boolean;
  hoverTranslation: {
    enabled: boolean;
  };
  amazonScript: {
    enabled: boolean;
  };
}

interface SettingsContextType {
  settings: SubtitleSettings;
  updateSettings: (settings: Partial<SubtitleSettings>) => void;
}

const defaultSettings: SubtitleSettings = {
  fontSize: 16,
  fontColor: "#383838",
  showSubtitles: true,
  showSubtitlesList: true,
  hoverTranslation: {
    enabled: true,
  },
  amazonScript: {
    enabled: false,
  },
};

const SettingsContext = createContext<SettingsContextType | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SubtitleSettings>(defaultSettings);

  useEffect(() => {
    // Load initial settings from storage
    chrome.storage.local.get('settings', (result) => {
      if (result.settings) {
        setSettings(result.settings);
      }
    });

    // Listen for settings changes from other contexts
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'local' && changes.settings?.newValue) {
        setSettings(changes.settings.newValue);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const updateSettings = (newSettings: Partial<SubtitleSettings>) => {
    const updatedSettings = {
      ...settings,
      ...newSettings,
    };

    // Update local state
    setSettings(updatedSettings);

    // Persist to storage
    chrome.storage.local.set({ settings: updatedSettings });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

export type { SubtitleSettings };
