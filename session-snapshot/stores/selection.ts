import { create } from "zustand";

export type EntityType = "customer" | "meter" | "invoice" | "payment" | "reading";

interface SelectionState {
  activeEntityType: EntityType;
  activeEntityId: string | null;
  selectedIds: string[];
  previewEntity: { type: EntityType; id: string } | null;
  selectEntity: (type: EntityType, id: string) => void;
  setSelectedIds: (ids: string[]) => void;
  clearSelection: () => void;
  setPreviewEntity: (p: { type: EntityType; id: string } | null) => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  activeEntityType: "customer",
  activeEntityId: null,
  selectedIds: [],
  previewEntity: null,
  selectEntity: (type, id) => set({ activeEntityType: type, activeEntityId: id }),
  setSelectedIds: (ids) => set({ selectedIds: ids }),
  clearSelection: () => set({ activeEntityId: null, selectedIds: [] }),
  setPreviewEntity: (p) => set({ previewEntity: p }),
}));
