import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Frontend render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '32px',
            background: '#ffffff',
            color: '#1f2f56',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div style={{ maxWidth: '640px', textAlign: 'center' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '28px' }}>Не удалось загрузить сайт</h1>
            <p style={{ margin: 0, lineHeight: 1.6 }}>
              Мы поймали ошибку во фронтенде. Обновите страницу, а если проблема повторится,
              покажите это сообщение разработчику.
            </p>
            {this.state.error?.message ? (
              <pre
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  background: '#f5f7fa',
                  borderRadius: '8px',
                  textAlign: 'left',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
              >
                {this.state.error.message}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
