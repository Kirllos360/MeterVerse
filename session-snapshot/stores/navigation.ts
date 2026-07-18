import { create } from "zustand";

interface NavigationState {
  recent: string[];
  recentMax: number;
  addRecent: (id: string) => void;
  clearRecent: () => void;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  recent: [],
  recentMax: 20,
  addRecent: (id) => {
    const { recent, recentMax } = get();
    set({ recent: [id, ...recent.filter((r) => r !== id)].slice(0, recentMax) });
  },
  clearRecent: () => set({ recent: [] }),
}));
