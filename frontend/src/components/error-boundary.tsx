'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  reset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center min-h-[40vh] gap-4 p-8 text-center"
        >
          <div className="text-4xl" aria-hidden="true">
            ⚠️
          </div>
          <h2 className="text-xl font-semibold text-neutral-800">Ocurrió un error inesperado</h2>
          <p className="text-sm text-neutral-500 max-w-md">
            {this.state.error?.message ?? 'Por favor intente nuevamente o comuníquese con soporte.'}
          </p>
          <Button onClick={this.reset} variant="outline">
            Intentar nuevamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
