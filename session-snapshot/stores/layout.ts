import { create } from "zustand";

interface LayoutState {
  explorerOpen: boolean;
  inspectorOpen: boolean;
  explorerWidth: number;
  inspectorWidth: number;
  setExplorerOpen: (o: boolean) => void;
  setInspectorOpen: (o: boolean) => void;
  toggleExplorer: () => void;
  toggleInspector: () => void;
  setExplorerWidth: (w: number) => void;
  setInspectorWidth: (w: number) => void;
  resetLayout: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  explorerOpen: true,
  inspectorOpen: true,
  explorerWidth: 390,
  inspectorWidth: 380,
  setExplorerOpen: (o) => set({ explorerOpen: o }),
  setInspectorOpen: (o) => set({ inspectorOpen: o }),
  toggleExplorer: () => set((s) => ({ explorerOpen: !s.explorerOpen })),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
  setExplorerWidth: (w) => set({ explorerWidth: w }),
  setInspectorWidth: (w) => set({ inspectorWidth: w }),
  resetLayout: () => set({ explorerOpen: true, inspectorOpen: true, explorerWidth: 390, inspectorWidth: 380 }),
}));
