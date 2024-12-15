import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { cn } from '../../utils/cn';
import { createShadowContainer } from '../../utils/create-shadow-container';

export type ToastType = 'info' | 'warning' | 'success' | 'error';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
  action?: ToastAction;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 5000,
  onClose,
  action,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const baseStyles = "fixed bottom-[16px] right-[16px] p-[16px] rounded-lg shadow-lg transform transition-all duration-300 max-w-md z-[9999]";
  const typeStyles = {
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-white",
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white"
  };

  return (
    <div
      className={cn(
        baseStyles,
        typeStyles[type],
        isVisible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
      )}
      role="alert"
    >
      <div className="flex items-center gap-[8px]">
        {type === 'warning' && (
          <svg className="w-[20px] h-[20px]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )}
        <div className="flex-1">
          <p className="text-[14px] font-medium">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-[8px] text-[14px] font-medium underline hover:opacity-80"
            >
              {action.label}
            </button>
          )}
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            if(onClose)
            setTimeout(onClose, 300);
          }}
          className="ml-auto hover:opacity-80"
        >
          <svg className="w-[16px] h-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Toast manager to handle multiple toasts
class ToastManager {
  private static container: HTMLDivElement | null = null;
  private static root: ReturnType<typeof createRoot> | null = null;
  private static shadowContainer: ShadowRoot | null = null;

  private static createContainer() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const shadowRoot = createShadowContainer('toast-container')
    container.appendChild(shadowRoot.host);
    this.shadowContainer = shadowRoot;
    this.container = container;
    this.root = createRoot(shadowRoot);
  }

  static show(props: ToastProps) {
    if (!this.container || !this.root) {
      this.createContainer();
    }

    const toastId = Math.random().toString(36).substr(2, 9);
    
    this.root?.render(
      <Toast
        {...props}
        onClose={() => {
          props.onClose?.();
          if (this.container && this.root) {
            this.root.unmount();
            this.root = null;
            
            // Remove the shadow DOM host element
            this.shadowContainer?.host.remove();
            this.shadowContainer = null;
            
            // Remove the container
            this.container.remove();
            this.container = null;
          }
        }}
      />
    );

    return toastId;
  }
}

export { Toast, ToastManager };
