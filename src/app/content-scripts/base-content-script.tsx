import React, { useContext } from "react";
import {
  StorageContext,
  StorageProvider,
} from "../../providers/storage-provider";

export const BaseContentScriptProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <StorageProvider>
      <BaseContentScript>{children}</BaseContentScript>
    </StorageProvider>
  );
};

const BaseContentScript = ({ children }: { children: React.ReactNode }) => {
  const storageContext = useContext(StorageContext);

  if (!storageContext?.settings?.showSubtitles) {
    return null;
  }

  return <>{children}</>;
};
