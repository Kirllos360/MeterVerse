import { create } from "zustand";

export interface Command {
  id: string;
  label: string;
  description: string;
  icon?: string;
  action: () => void;
}

interface CommandPaletteStore {
  open: boolean;
  query: string;
  setOpen: (o: boolean) => void;
  setQuery: (q: string) => void;
  registerCommands: (cmds: Command[]) => void;
  commands: Command[];
}

export const useCommandPalette = create<CommandPaletteStore>((set) => ({
  open: false,
  query: "",
  commands: [],
  setOpen: (o) => set({ open: o, query: "" }),
  setQuery: (q) => set({ query: q }),
  registerCommands: (cmds) =>
    set((s) => ({ commands: [...s.commands.filter((c) => !cmds.find((n) => n.id === c.id)), ...cmds] })),
}));
