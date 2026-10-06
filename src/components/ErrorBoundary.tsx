import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center',
            color: '#ffffff',
            background: 'transparent',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              padding: '2rem',
              borderRadius: '16px',
              background: '#16171a',
              border: '1px solid #2e3036',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⚠️</div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: '#f43f5e',
                fontFamily: 'Figtree, sans-serif',
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#a1a1aa',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
                fontFamily: 'Figtree, sans-serif',
              }}
            >
              An unexpected error occurred while displaying this section. Please refresh or return to the home page.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: '#2dd4bf',
                  color: '#090a0f',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'Figtree, sans-serif',
                }}
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: '#27272a',
                  color: '#e4e4e7',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  border: '1px solid #3f3f46',
                  cursor: 'pointer',
                  fontFamily: 'Figtree, sans-serif',
                }}
              >
                Reload
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '8px',
                  background: '#18191d',
                  color: '#a1a1aa',
                  fontWeight: 500,
                  fontSize: '0.875rem',
                  border: '1px solid #27272a',
                  cursor: 'pointer',
                  fontFamily: 'Figtree, sans-serif',
                }}
              >
                Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
