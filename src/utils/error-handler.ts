import { ToastManager } from '../components/ui/toast';
import { BUG_REPORT_FORM_URL } from '../lib/constants';

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    return new Error(String(maybeError));
  }
}

interface ErrorToastOptions {
  showReportButton?: boolean;
}

export const showErrorToast = (error: Error | string, options: ErrorToastOptions = {}) => {
  const message = typeof error === "string" ? error : error.message;
  
  ToastManager.show({
    message,
    type: "error",
    duration: 5000,
    action: options.showReportButton ? {
      label: "Report Bug",
      onClick: () => {
        // Open Google Form in a new tab
        window.open(BUG_REPORT_FORM_URL, '_blank');
      }
    } : undefined
  });
};

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

export const initializeErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    showErrorToast(event.reason, { showReportButton: true });
  });

  // Handle runtime errors
  window.addEventListener("error", (event) => {
    console.error("Runtime error:", event.error);
    showErrorToast(event.error || event.message, { showReportButton: true });
  });

  // Override console.error to show toasts
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError.apply(console, args);
    const error = args[0];
    if (error instanceof Error) {
      showErrorToast(error, { showReportButton: true });
    } else {
      showErrorToast(args.join(" "), { showReportButton: true });
    }
  };
};
