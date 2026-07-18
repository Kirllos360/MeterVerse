export interface MemorySnapshot {
  timestamp: number
  jsHeapSizeLimit?: number
  totalJSHeapSize?: number
  usedJSHeapSize?: number
  domNodes: number
  eventListeners: number
}

export class MemoryProfiler {
  private snapshots: MemorySnapshot[] = []
  private intervalId?: ReturnType<typeof setInterval>
  private warningThreshold = 0.8 // 80% of heap limit

  start(intervalMs = 30000): void {
    this.capture()
    this.intervalId = setInterval(() => this.capture(), intervalMs)
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId)
  }

  capture(): MemorySnapshot {
    const perf = (performance as unknown as { memory?: { jsHeapSizeLimit: number; totalJSHeapSize: number; usedJSHeapSize: number } }).memory
    const snapshot: MemorySnapshot = {
      timestamp: Date.now(),
      jsHeapSizeLimit: perf?.jsHeapSizeLimit,
      totalJSHeapSize: perf?.totalJSHeapSize,
      usedJSHeapSize: perf?.usedJSHeapSize,
      domNodes: document.querySelectorAll("*").length,
      eventListeners: 0,
    }

    this.snapshots.push(snapshot)
    if (this.snapshots.length > 100) this.snapshots.shift()

    if (perf && snapshot.usedJSHeapSize && snapshot.jsHeapSizeLimit) {
      const ratio = snapshot.usedJSHeapSize / snapshot.jsHeapSizeLimit
      if (ratio > this.warningThreshold) {
        console.warn(`[Memory] Warning: ${(ratio * 100).toFixed(1)}% of heap used`)
      }
    }

    return snapshot
  }

  getSnapshots(): MemorySnapshot[] { return [...this.snapshots] }

  getLeakAnalysis(): string[] {
    const warnings: string[] = []
    if (this.snapshots.length < 3) return warnings

    const first = this.snapshots[0]
    const last = this.snapshots[this.snapshots.length - 1]

    if (last.domNodes && first.domNodes && (last.domNodes / first.domNodes) > 1.5) {
      warnings.push(`DOM nodes grew from ${first.domNodes} to ${last.domNodes} — possible leak`)
    }

    if (last.usedJSHeapSize && first.usedJSHeapSize && (last.usedJSHeapSize / first.usedJSHeapSize) > 1.5) {
      const increase = (((last.usedJSHeapSize - first.usedJSHeapSize) / first.usedJSHeapSize) * 100).toFixed(1)
      warnings.push(`Heap grew ${increase}% — possible leak`)
    }

    return warnings
  }

  clear(): void { this.snapshots = [] }
}
