interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: Record<string, any>;
}

class Logger {
  private static instance: Logger;
  private readonly MAX_LOG_SIZE = 100;
  private logs: LogEntry[] = [];

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private addLog(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOG_SIZE) {
      this.logs.pop();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console[entry.level](entry);
    }
  }

  info(message: string, context?: Record<string, any>): void {
    this.addLog({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      context
    });
  }

  warn(message: string, context?: Record<string, any>): void {
    this.addLog({
      level: 'warn',
      message,
      timestamp: new Date().toISOString(),
      context
    });
  }

  error(error: Error | string, context?: Record<string, any>): void {
    const message = error instanceof Error ? error.message : error;
    const errorContext = error instanceof Error 
      ? { ...context, stack: error.stack }
      : context;

    this.addLog({
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      context: errorContext
    });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
