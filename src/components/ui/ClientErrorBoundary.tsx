// src/components/ui/ClientErrorBoundary.tsx
'use client';

import React, { ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

interface ClientErrorBoundaryProps {
  children: React.ReactNode;
  level?: 'root' | 'navigation' | 'content' | 'footer';
  fallback?: React.ReactNode;
}

export function ClientErrorBoundary({ 
  children, 
  level = 'content',
  fallback 
}: ClientErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // Log error to console with level context
    console.error(`${level} level error:`, error, errorInfo);
    
    // Here you can add custom error reporting
    // For example, send to Sentry, LogRocket, etc.
    if (typeof window !== 'undefined') {
      // reportErrorToService({
      //   error: error.message,
      //   stack: error.stack,
      //   componentStack: errorInfo.componentStack,
      //   level,
      //   timestamp: new Date().toISOString(),
      //   url: window.location.href,
      // });
    }
  };

  return (
    <ErrorBoundary onError={handleError} fallback={fallback}>
      {children}
    </ErrorBoundary>
  );
}

// Specialized components for different levels
export function RootErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ClientErrorBoundary level="root">
      {children}
    </ClientErrorBoundary>
  );
}

export function NavigationErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ClientErrorBoundary 
      level="navigation"
      fallback={
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-600 text-sm">
            Navigation đang gặp sự cố. Vui lòng tải lại trang.
          </p>
        </div>
      }
    >
      {children}
    </ClientErrorBoundary>
  );
}

export function ContentErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ClientErrorBoundary level="content">
      {children}
    </ClientErrorBoundary>
  );
}

export function FooterErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ClientErrorBoundary 
      level="footer"
      fallback={
        <div className="bg-gray-100 p-4 text-center">
          <p className="text-gray-600 text-sm">
            Footer đang gặp sự cố tạm thời.
          </p>
        </div>
      }
    >
      {children}
    </ClientErrorBoundary>
  );
}