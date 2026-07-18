import type { ProgramContract, ProgramRegistration, ProgramState, ProgramLifecycle, ProgramHost, RuntimeError, ProgramMetadata } from "../contracts/program"
import type { RuntimeContext } from "../contracts/runtime"
import { TypedEvent } from "./events"
import { RuntimeServiceContainer } from "./services"

export interface ProgramManager {
  readonly programs: Map<string, ProgramContract>
  readonly registrations: Map<string, ProgramRegistration>
  readonly activeProgramId: string | null

  register(registration: ProgramRegistration): void
  unregister(programId: string): void
  create(programId: string, host: ProgramHost): Promise<ProgramContract>
  destroy(programId: string): Promise<void>
  get(programId: string): ProgramContract | undefined
  getAll(): ProgramContract[]
  getActive(): ProgramContract | undefined
  suspendAll(): Promise<void>
  resumeAll(): Promise<void>
  destroyAll(): Promise<void>
  getByCategory(category: string): ProgramContract[]

  onStateChange: TypedEvent<{ programId: string; from: ProgramState; to: ProgramState }>
  onError: TypedEvent<RuntimeError>
}

export class RuntimeProgramManager implements ProgramManager {
  readonly programs = new Map<string, ProgramContract>()
  readonly registrations = new Map<string, ProgramRegistration>()
  activeProgramId: string | null = null

  onStateChange = new TypedEvent<{ programId: string; from: ProgramState; to: ProgramState }>()
  onError = new TypedEvent<RuntimeError>()

  register(registration: ProgramRegistration): void {
    this.registrations.set(registration.id, registration)
  }

  unregister(programId: string): void {
    this.registrations.delete(programId)
  }

  async create(programId: string, host: ProgramHost): Promise<ProgramContract> {
    const registration = this.registrations.get(programId)
    if (!registration) throw new Error(`[Program] Not registered: ${programId}`)
    const program = registration.create(host)
    this.programs.set(programId, program)
    return program
  }

  async destroy(programId: string): Promise<void> {
    const program = this.programs.get(programId)
    if (program) {
      await program.destroy()
      this.programs.delete(programId)
    }
    if (this.activeProgramId === programId) this.activeProgramId = null
  }

  get(programId: string): ProgramContract | undefined {
    return this.programs.get(programId)
  }

  getAll(): ProgramContract[] {
    return Array.from(this.programs.values())
  }

  getActive(): ProgramContract | undefined {
    return this.activeProgramId ? this.programs.get(this.activeProgramId) : undefined
  }

  async suspendAll(): Promise<void> {
    for (const program of this.programs.values()) {
      if (program.state === "active") await program.lifecycle.suspend()
    }
  }

  async resumeAll(): Promise<void> {
    for (const program of this.programs.values()) {
      if (program.state === "deactivated") {
        await program.lifecycle.resume({ programId: program.id, state: program.state, timestamp: Date.now() })
      }
    }
  }

  async destroyAll(): Promise<void> {
    for (const [id] of this.programs) await this.destroy(id)
  }

  getByCategory(category: string): ProgramContract[] {
    return this.getAll().filter((p) => p.metadata.category === category)
  }
}
