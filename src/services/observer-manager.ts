type ElementCallback = (element: HTMLElement) => void;

interface DOMObserverManagerType {
  observer: MutationObserver | null;
  callbacks: Map<string, ElementCallback>;
  observerConfig: MutationObserverInit;
  init(): void;
  register(selector: string, callback: ElementCallback): () => void;
  unregister(selector: string): void;
}

const DOMObserverManager: DOMObserverManagerType = {
    observer: null,
    callbacks: new Map<string, ElementCallback>(),
    observerConfig: {
      childList: true,
      subtree: true,
    },
  
    init() {
      if (!this.observer) {
        this.observer = new MutationObserver((mutations: MutationRecord[]) => {
          this.callbacks.forEach((callback, selector) => {
            const element = document.querySelector<HTMLElement>(selector);
            if (element) {
              callback(element);
              this.unregister(selector);
            }
          });
        });
  
        this.observer.observe(document.documentElement, this.observerConfig);
      }
    },
  
    register(selector: string, callback: ElementCallback) {
      const element = document.querySelector<HTMLElement>(selector);
      if (element) {
        callback(element);
        return () => {};
      }
  
      this.callbacks.set(selector, callback);
      this.init();
  
      return () => this.unregister(selector);
    },
  
    unregister(selector: string) {
      this.callbacks.delete(selector);
      
      if (this.callbacks.size === 0 && this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
};

export default DOMObserverManager;