import * as React from "react";
import { useEffect, useState, createContext } from "react";

const defaultValue = {
  settings: {
    fontSize: 16,
    fontColor: "#383838",
    showSubtitles: false,
  },
};

export const StorageContext = createContext(defaultValue);

export const StorageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [storage, setStorage] = useState(defaultValue);

  useEffect(() => {
    chrome.storage.local.get(["settings"], (result) => {
      setStorage({ settings: result.settings || defaultValue.settings });
    });

    const handleStorageChange = (changes: any) => {
      if (changes.settings) {
        setStorage({ settings: changes.settings.newValue });
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
};
