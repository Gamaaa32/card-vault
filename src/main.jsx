import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'

// Error boundary to catch rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('React Error Boundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          padding: '40px',
          fontFamily: 'system-ui, sans-serif',
          maxWidth: '600px',
          margin: '0 auto'
        }
      },
        React.createElement('h1', { style: { color: '#dc2626' } }, '⚠️ Rendering Error'),
        React.createElement('pre', {
          style: {
            background: '#fef2f2',
            padding: '16px',
            borderRadius: '8px',
            overflow: 'auto',
            fontSize: '14px',
            color: '#991b1b',
            border: '1px solid #fecaca',
            whiteSpace: 'pre-wrap'
          }
        }, this.state.error?.stack || this.state.error?.toString()),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          style: {
            marginTop: '16px',
            padding: '8px 24px',
            background: '#ea580c',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }
        }, 'Reload Page')
      );
    }
    return this.props.children;
  }
}

// Dynamic import to catch module loading errors
async function loadAndRender() {
  try {
    const { default: App } = await import('./App.jsx');
    ReactDOM.createRoot(document.getElementById('root')).render(
      React.createElement(ErrorBoundary, null,
        React.createElement(App, null)
      )
    );
  } catch (error) {
    console.error('Failed to load App:', error);
    document.getElementById('root').innerHTML = `
      <div style="padding:40px;font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
        <h1 style="color:#dc2626">⚠️ App Loading Error</h1>
        <p style="color:#374151">Failed to load the application module.</p>
        <pre style="background:#fef2f2;padding:16px;border-radius:8px;overflow:auto;font-size:14px;color:#991b1b;border:1px solid #fecaca;white-space:pre-wrap">${error?.stack || error?.toString()}</pre>
        <button onclick="window.location.reload()" style="margin-top:16px;padding:8px 24px;background:#ea580c;color:white;border:none;border-radius:8px;font-weight:bold;cursor:pointer">Reload Page</button>
      </div>
    `;
  }
}

loadAndRender();
