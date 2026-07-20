import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"

export interface CommandContext {
  programId?: string
  searchQuery?: string
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean }
}

export interface CommandResult {
  success: boolean
  message?: string
}

export interface CommandRegistration extends Registrable {
  execute: (context: CommandContext) => Promise<CommandResult>
  canExecute?: (context: CommandContext) => boolean
  shortcut?: { key: string; ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean }
  icon?: string
  group?: string
  keywords?: string[]
  destructive?: boolean
  confirmMessage?: string
  availableInPrograms?: string[]
}

export class CommandRegistry extends BaseRegistry<CommandRegistration> {
  constructor() { super("command-registry", "Command Registry") }

  async execute(commandId: string, context: CommandContext): Promise<CommandResult> {
    const cmd = this.get(commandId)
    if (!cmd) return { success: false, message: `Command "${commandId}" not found` }
    if (cmd.canExecute && !cmd.canExecute(context)) return { success: false, message: "Cannot execute in current context" }
    return cmd.execute(context)
  }

  getContextualCommands(context: CommandContext): CommandRegistration[] {
    return this.getAll().filter((cmd) => {
      if (cmd.availableInPrograms && context.programId && !cmd.availableInPrograms.includes(context.programId)) return false
      if (cmd.canExecute && !cmd.canExecute(context)) return false
      return cmd.enabled !== false
    })
  }

  searchCommands(query: string): { command: CommandRegistration; score: number; matchedTerms: string[] }[] {
    const q = query.toLowerCase()
    return this.getAll()
      .map((cmd) => {
        let score = 0
        const matched: string[] = []
        if ((cmd.name || cmd.id).toLowerCase().includes(q)) { score += 10; matched.push("name") }
        if (cmd.id.toLowerCase().includes(q)) { score += 8; matched.push("id") }
        if (cmd.keywords?.some((k) => k.toLowerCase().includes(q))) { score += 5; matched.push("keywords") }
        if (cmd.group?.toLowerCase().includes(q)) { score += 3; matched.push("group") }
        return { command: cmd, score, matchedTerms: matched }
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
  }

  getByGroup(group: string): CommandRegistration[] {
    return this.getAll().filter((c) => c.group === group)
  }
}

export const BUILTIN_COMMANDS: CommandRegistration[] = [
  { id: "command:openPalette", name: "Open Command Palette", execute: async () => ({ success: true }), shortcut: { key: "k", meta: true, ctrl: true }, group: "system", keywords: ["palette", "cmd", "k", "search"], priority: 100 },
  { id: "command:openProgram", name: "Open Program...", execute: async () => ({ success: true }), shortcut: { key: "p", meta: true, ctrl: true }, group: "navigation", keywords: ["open", "program", "go"], priority: 90 },
  { id: "command:quickSearch", name: "Quick Search", execute: async () => ({ success: true }), shortcut: { key: "f", meta: true, ctrl: true }, group: "search", keywords: ["search", "find"], priority: 80 },
  { id: "command:newReading", name: "Add New Reading", execute: async () => ({ success: true }), shortcut: { key: "r", meta: true, shift: true }, group: "actions", keywords: ["reading", "meter", "add"], availableInPrograms: ["meters", "readings"], priority: 70 },
  { id: "command:newInvoice", name: "Generate Invoice", execute: async () => ({ success: true }), shortcut: { key: "i", meta: true, shift: true }, group: "actions", keywords: ["invoice", "bill", "generate"], availableInPrograms: ["invoices", "billing"], priority: 70 },
]
