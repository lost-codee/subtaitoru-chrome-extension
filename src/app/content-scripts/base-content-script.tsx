import React from "react";
import { StorageProvider } from "../../providers/storage-provider";

export const BaseContentScript = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <StorageProvider>{children}</StorageProvider>;
};
