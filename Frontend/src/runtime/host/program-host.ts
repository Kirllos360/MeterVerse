import type { ProgramHost, ProgramContract, NavigationTarget } from "../contracts/program"
import type { RuntimeContext } from "../contracts/runtime"

export class RuntimeProgramHost implements ProgramHost {
  readonly programId: string
  readonly context: RuntimeContext
  private _title = ""
  private _icon = ""
  private _badgeCount?: number
  private _isDirty = false

  constructor(programId: string, context: RuntimeContext) {
    this.programId = programId
    this.context = context
  }

  setTitle(title: string): void { this._title = title }
  setIcon(icon: string): void { this._icon = icon }
  setBadge(count?: number): void { this._badgeCount = count }
  setDirty(dirty: boolean): void { this._isDirty = dirty }

  async requestFocus(): Promise<boolean> {
    const program = this.context.programs.get(this.programId)
    if (!program) return false
    return this.context.focus.requestFocus(program)
  }

  async close(): Promise<void> {
    await this.context.programs.destroy(this.programId)
  }

  async minimize(): Promise<void> {
    const program = this.context.programs.get(this.programId)
    if (program) await program.lifecycle.deactivate()
  }

  async navigate(target: NavigationTarget): Promise<void> {
    await this.context.navigation.navigate(target)
  }

  async openProgram(programId: string): Promise<ProgramContract> {
    const host = new RuntimeProgramHost(programId, this.context)
    return this.context.programs.create(programId, host)
  }

  get title(): string { return this._title }
  get icon(): string { return this._icon }
  get badgeCount(): number | undefined { return this._badgeCount }
  get isDirty(): boolean { return this._isDirty }
}
