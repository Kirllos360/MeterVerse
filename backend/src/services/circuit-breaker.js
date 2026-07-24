export class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name
    this.maxFailures = options.maxFailures || 5
    this.resetTimeout = options.resetTimeout || 30000
    this.state = "closed"
    this.failures = 0
    this.lastFailureTime = null
  }

  async call(fn) {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
        this.state = "half-open"
      } else {
        return { success: false, error: `Circuit breaker open for ${this.name}`, circuitOpen: true }
      }
    }

    try {
      const result = await fn()
      if (this.state === "half-open") {
        this.state = "closed"
        this.failures = 0
      }
      return { success: true, data: result }
    } catch (err) {
      this.failures++
      this.lastFailureTime = Date.now()
      if (this.failures >= this.maxFailures) {
        this.state = "open"
      }
      return { success: false, error: err.message }
    }
  }

  getStatus() {
    return { name: this.name, state: this.state, failures: this.failures }
  }
}
