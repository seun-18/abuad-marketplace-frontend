import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error, info) {
    console.error('UI crash:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="error-boundary-page"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.25rem',
            background: '#f7f5f1',
            color: '#141310',
            fontFamily: '"DM Sans", system-ui, sans-serif',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '24rem',
              background: '#fff',
              border: '1px solid rgba(20, 19, 16, 0.08)',
              borderRadius: '1rem',
              padding: '1.5rem',
              textAlign: 'center',
              boxShadow: '0 8px 28px rgba(20, 19, 16, 0.06)',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#b45309',
              }}
            >
              ABUAD Market Place
            </p>
            <h1
              style={{
                margin: '0.75rem 0 0.5rem',
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: '1.35rem',
                fontWeight: 550,
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '0.875rem',
                color: 'rgba(20, 19, 16, 0.58)',
                lineHeight: 1.55,
              }}
            >
              {this.state.message}
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginTop: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '999px',
                  border: 'none',
                  background: '#b45309',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => window.location.assign('/')}
                style={{
                  width: '100%',
                  padding: '0.7rem 1rem',
                  borderRadius: '999px',
                  border: '1px solid rgba(20, 19, 16, 0.12)',
                  background: 'transparent',
                  color: '#141310',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Go home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
