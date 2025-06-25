// src/components/ui/ErrorBoundary.tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (Sentry, LogRocket, etc.)
    // reportError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center p-4">
          <Card className="max-w-lg w-full border-0 shadow-xl">
            <CardContent className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Oops! Có lỗi xảy ra
              </h2>
              
              <p className="text-gray-600 mb-6">
                Chúng tôi đã ghi nhận lỗi này và sẽ khắc phục sớm nhất có thể.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-4 rounded-lg mb-6 text-sm">
                  <summary className="cursor-pointer font-medium text-red-600 mb-2">
                    Chi tiết lỗi (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-red-800">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Thử lại
                </Button>
                
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Về trang chủ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for easier usage
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

// Hook for error reporting in functional components
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    console.error('Manual error report:', error, errorInfo);
    // Report to error tracking service
    // reportError(error, errorInfo);
  };
}