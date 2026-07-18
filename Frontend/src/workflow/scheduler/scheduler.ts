import { TypedEvent } from "@/runtime/kernel/events"
import type { WorkflowEngine } from "../engine/workflow-engine"

export interface ScheduledJob {
  id: string
  name: string
  workflowId: string
  cron: string
  input?: Record<string, unknown>
  status: "active" | "paused" | "completed" | "failed"
  lastExecutedAt?: number
  nextRunAt?: number
  executionCount: number
  maxExecutions: number
}

export class WorkflowScheduler {
  private jobs = new Map<string, ScheduledJob>()
  private timers = new Map<string, ReturnType<typeof setInterval>>()
  private engine: WorkflowEngine

  onJobExecuted = new TypedEvent<{ jobId: string; executionId: string }>()

  constructor(engine: WorkflowEngine) { this.engine = engine }

  schedule(job: ScheduledJob): void {
    this.jobs.set(job.id, job)
    this.scheduleNext(job)
  }

  cancel(jobId: string): void {
    const timer = this.timers.get(jobId)
    if (timer) clearInterval(timer)
    this.jobs.delete(jobId)
  }

  pause(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (job) { job.status = "paused"; this.clearTimer(jobId) }
  }

  resume(jobId: string): void {
    const job = this.jobs.get(jobId)
    if (job) { job.status = "active"; this.scheduleNext(job) }
  }

  getJob(id: string): ScheduledJob | undefined { return this.jobs.get(id) }
  getAllJobs(): ScheduledJob[] { return Array.from(this.jobs.values()) }

  private scheduleNext(job: ScheduledJob): void {
    if (job.status !== "active" || job.executionCount >= job.maxExecutions) return
    const interval = this.parseCron(job.cron)
    if (interval <= 0) return
    const timer = setInterval(async () => {
      if (job.executionCount >= job.maxExecutions) { this.clearTimer(job.id); return }
      try {
        const execution = await this.engine.start(job.workflowId, job.input || {})
        job.executionCount++
        job.lastExecutedAt = Date.now()
        this.onJobExecuted.dispatch({ jobId: job.id, executionId: execution.id })
      } catch (err) { console.error(`[Scheduler] Job ${job.id} failed:`, err) }
    }, interval)
    this.timers.set(job.id, timer)
  }

  private clearTimer(jobId: string): void {
    const timer = this.timers.get(jobId)
    if (timer) { clearInterval(timer); this.timers.delete(jobId) }
  }

  private parseCron(cron: string): number {
    const parts = cron.split(" ")
    if (parts.length < 5) return 0
    const minute = parts[0] === "*" ? 1 : parseInt(parts[0])
    return minute * 60 * 1000 // simplified: every N minutes
  }

  destroy(): void {
    for (const [, timer] of this.timers) clearInterval(timer)
    this.timers.clear()
  }
}
