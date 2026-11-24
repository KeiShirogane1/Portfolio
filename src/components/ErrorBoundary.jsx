import { Component } from 'react'

/* A render error can only be caught by a class component, so this stays a
   class even though the rest of the app uses function components. */
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[portfolio] render error:', error, info?.componentStack)
  }

  render() {
    const { error } = this.state

    if (error) {
      return (
        <div style={{
          padding: '2rem',
          background: '#080B12',
          color: '#F4F6FA',
          fontFamily: 'system-ui, sans-serif',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <h2 style={{ color: '#ff4d4d', margin: 0 }}>Portfolio Error</h2>
          <pre style={{
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontSize: '0.875rem',
            color: '#929BAD'
          }}>{error.message}</pre>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#929BAD' }}>
            Check the browser console for more details. If this persists, the asset may be missing or a component may have thrown during render.
          </p>
        </div>
      )
    }

    return this.props.children
  }
}
