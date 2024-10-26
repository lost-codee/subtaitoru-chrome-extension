import React, { Component, ReactNode } from "react";

// Define the state type
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

// Define the props type if needed (empty for now)
interface ErrorBoundaryProps {
  children: ReactNode;
}

// Create the ErrorBoundary class component
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  // Update state when an error is caught
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  // Log error details (optional)
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  // Render a fallback UI if an error occurs
  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-100 text-red-800 p-4 rounded-md">
          <h2 className="font-bold text-lg">Something went wrong.</h2>
          <p>{this.state.errorMessage}</p>
        </div>
      );
    }

    // Otherwise, render the child components as normal
    return this.props.children;
  }
}

export default ErrorBoundary;
