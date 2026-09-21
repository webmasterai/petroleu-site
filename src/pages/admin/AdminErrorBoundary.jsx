import { Component } from 'react'

/**
 * Catches render errors in the admin main pane so the shell is not left blank.
 */
export default class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[admin] screen failed', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <p className="font-semibold">Unable to load this screen.</p>
          <p className="mt-1 text-red-800/80">
            Something went wrong while rendering. Check the browser console for details.
          </p>
          <button
            type="button"
            className="mt-3 rounded-md border border-red-300 bg-white px-3 py-1.5 text-xs font-medium hover:bg-red-50"
            onClick={() => this.setState({ error: null })}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
