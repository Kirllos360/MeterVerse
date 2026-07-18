import type { ProgramManager } from "../kernel/program"
import type { ProgramContract, ProgramRegistration } from "../contracts/program"

export class ProgramService {
  constructor(private programs: ProgramManager) {}

  register(registration: ProgramRegistration): void {
    this.programs.register(registration)
  }

  unregister(programId: string): void {
    this.programs.unregister(programId)
  }

  get(programId: string): ProgramContract | undefined {
    return this.programs.get(programId)
  }

  getAll(): ProgramContract[] {
    return this.programs.getAll()
  }

  getActive(): ProgramContract | undefined {
    return this.programs.getActive()
  }

  getByCategory(category: string): ProgramContract[] {
    return this.programs.getByCategory(category)
  }
}
