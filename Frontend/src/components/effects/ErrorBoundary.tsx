"use client"

import { Component, type ReactNode, type ErrorInfo } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
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
    console.error("[ErrorBoundary]", error.message)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex items-center justify-center h-full p-6">
          <div className="text-center max-w-sm">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--status-error)" strokeWidth="1.5" className="mx-auto mb-3">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>Something went wrong</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>{this.state.error?.message || "An unexpected error occurred"}</p>
            <button onClick={() => this.setState({ hasError: false, error: undefined })}
              className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white" style={{ backgroundColor: "var(--brand)" }}>
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

