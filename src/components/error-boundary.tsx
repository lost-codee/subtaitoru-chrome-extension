import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ToastManager } from './ui/toast';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Show error toast
    ToastManager.show({
      message: 'An unexpected error occurred. Please try again later.',
      type: 'error',
      duration: 5000
    });
  }

  public render() {
    if (this.state.hasError) {
      return null; // Return null since we're showing a toast instead
    }

    return this.props.children;
  }
}
