import { create } from "zustand";

export type ExplorerDensity = "compact" | "default" | "comfortable";

interface ExplorerState {
  search: string;
  filter: string;
  density: ExplorerDensity;
  groupBy: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  view: string;
  favorites: string[];
  pinnedIds: string[];
  savedView: string;
  setSearch: (s: string) => void;
  setFilter: (f: string) => void;
  setDensity: (d: ExplorerDensity) => void;
  setGroupBy: (g: string) => void;
  setSortBy: (s: string) => void;
  setSortDir: (d: "asc" | "desc") => void;
  setView: (v: string) => void;
  toggleFavorite: (id: string) => void;
  togglePinned: (id: string) => void;
  setSavedView: (v: string) => void;
  resetFilters: () => void;
}

export const useExplorerStore = create<ExplorerState>((set, get) => ({
  search: "",
  filter: "all",
  density: "default",
  groupBy: "none",
  sortBy: "name",
  sortDir: "asc",
  view: "list",
  favorites: [],
  pinnedIds: [],
  savedView: "all",
  setSearch: (s) => set({ search: s }),
  setFilter: (f) => set({ filter: f }),
  setDensity: (d) => set({ density: d }),
  setGroupBy: (g) => set({ groupBy: g }),
  setSortBy: (s) => set({ sortBy: s }),
  setSortDir: (d) => set({ sortDir: d }),
  setView: (v) => set({ view: v }),
  toggleFavorite: (id) => { const f = get().favorites; set({ favorites: f.includes(id) ? f.filter((x) => x !== id) : [...f, id] }); },
  togglePinned: (id) => { const p = get().pinnedIds; set({ pinnedIds: p.includes(id) ? p.filter((x) => x !== id) : [...p, id] }); },
  setSavedView: (v) => set({ savedView: v }),
  resetFilters: () => set({ search: "", filter: "all", groupBy: "none", sortBy: "name", sortDir: "asc" }),
}));
