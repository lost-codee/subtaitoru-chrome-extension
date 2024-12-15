import { useEffect, useState } from "react";
import DOMObserverManager from "../services/observer-manager";

export const useElementObserver = (selector: string) => {
    const [element, setElement] = useState<Element | null>(null);
  
    useEffect(() => {
      // Register with the shared observer
      const cleanup = DOMObserverManager.register(selector, (foundElement) => {
        setElement(foundElement);
      });
  
      // Cleanup when component unmounts
      return cleanup;
    }, [selector]);
  
    return element;
};