"use client"

import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
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

  componentDidCatch(error: Error, info: any) {
    console.error("[ErrorBoundary]", error.message, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Something went wrong</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <Button
            variant="outline"
            onClick={() => {
              this.setState({ hasError: false, error: undefined })
              window.location.reload()
            }}
          >
            Try again
          </Button>
        </div>
      )
    }
    return this.props.children
  }
}
