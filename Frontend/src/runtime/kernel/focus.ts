import { TypedEvent } from "./events"
import type { ProgramContract } from "../contracts/program"

export interface FocusEntry {
  programId: string
  timestamp: number
}

export interface FocusChangeEvent {
  programId: string | null
  previousProgramId: string | null
}

export interface FocusManager {
  readonly focusedProgram: ProgramContract | null
  readonly focusStack: FocusEntry[]
  readonly focusHistory: FocusEntry[]

  requestFocus(program: ProgramContract): Promise<boolean>
  releaseFocus(program: ProgramContract): Promise<void>
  focusNext(): Promise<boolean>
  focusPrevious(): Promise<boolean>
  isFocused(program: ProgramContract): boolean
  getFocusOrder(): ProgramContract[]

  onFocusChange: TypedEvent<FocusChangeEvent>
}

export class RuntimeFocusManager implements FocusManager {
  private _focusedProgram: ProgramContract | null = null
  private _focusStack: FocusEntry[] = []
  private _focusHistory: FocusEntry[] = []
  private programs: ProgramContract[] = []

  onFocusChange = new TypedEvent<FocusChangeEvent>()

  get focusedProgram(): ProgramContract | null { return this._focusedProgram }
  get focusStack(): FocusEntry[] { return [...this._focusStack] }
  get focusHistory(): FocusEntry[] { return [...this._focusHistory] }

  async requestFocus(program: ProgramContract): Promise<boolean> {
    const previous = this._focusedProgram
    if (previous) this._focusStack.push({ programId: previous.id, timestamp: Date.now() })
    this._focusedProgram = program
    this._focusHistory.push({ programId: program.id, timestamp: Date.now() })
    if (this._focusHistory.length > 100) this._focusHistory.shift()
    this.onFocusChange.dispatch({ programId: program.id, previousProgramId: previous?.id ?? null })
    return true
  }

  async releaseFocus(program: ProgramContract): Promise<void> {
    if (this._focusedProgram?.id !== program.id) return
    const previous = this._focusStack.pop()
    this._focusedProgram = previous ? this.programs.find((p) => p.id === previous.programId) ?? null : null
    this.onFocusChange.dispatch({ programId: this._focusedProgram?.id ?? null, previousProgramId: program.id })
  }

  async focusNext(): Promise<boolean> {
    if (!this.programs.length) return false
    const idx = this._focusedProgram ? this.programs.indexOf(this._focusedProgram) : -1
    const next = (idx + 1) % this.programs.length
    return this.requestFocus(this.programs[next])
  }

  async focusPrevious(): Promise<boolean> {
    if (!this.programs.length) return false
    const idx = this._focusedProgram ? this.programs.indexOf(this._focusedProgram) : 0
    const prev = (idx - 1 + this.programs.length) % this.programs.length
    return this.requestFocus(this.programs[prev])
  }

  isFocused(program: ProgramContract): boolean {
    return this._focusedProgram?.id === program.id
  }

  getFocusOrder(): ProgramContract[] {
    return [...this.programs]
  }

  setPrograms(programs: ProgramContract[]): void {
    this.programs = programs
  }
}
