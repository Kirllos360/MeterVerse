"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  correlationId?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("[ErrorBoundary]", error.message, "CorrelationID:", this.props.correlationId || "N/A")
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      const corrId = this.props.correlationId || "N/A"
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center max-w-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--status-error)" strokeWidth="1.5" className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Something went wrong</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{this.state.error?.message || "An unexpected error occurred"}</p>
            <p className="text-xs mt-2 font-mono" style={{ color: "var(--text-muted)" }}>Ref: {corrId}</p>
            <div className="flex gap-2 justify-center mt-3">
              <button onClick={this.handleRetry}
                className="px-3 py-2 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--brand)" }}>
                Try again
              </button>
              <button onClick={() => window.location.reload()}
                className="px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: "var(--surface-elevated)", color: "var(--text-primary)" }}>
                Reload page
              </button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
