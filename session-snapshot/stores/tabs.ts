import { create } from "zustand";

export interface Tab {
  id: string;
  type: string;
  entityId: string;
  label: string;
}

interface TabsState {
  tabs: Tab[];
  activeTabId: string | null;
  openTab: (type: string, entityId: string, label: string) => void;
  closeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  closeAll: () => void;
}

const MAX_TABS = 10;

export const useTabsStore = create<TabsState>((set, get) => ({
  tabs: [],
  activeTabId: null,

  openTab: (type, entityId, label) => {
    const { tabs } = get();
    const existing = tabs.find((t) => t.type === type && t.entityId === entityId);
    if (existing) { set({ activeTabId: existing.id }); return; }
    const toRemove = tabs.length >= MAX_TABS ? tabs.find((t) => t.id !== get().activeTabId) : null;
    const remaining = toRemove ? tabs.filter((t) => t.id !== toRemove.id) : tabs;
    const newTab: Tab = { id: `${type}-${entityId}-${Date.now()}`, type, entityId, label };
    set({ tabs: [...remaining, newTab], activeTabId: newTab.id });
  },

  closeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const remaining = tabs.filter((t) => t.id !== tabId);
    let newActive = activeTabId;
    if (activeTabId === tabId) {
      const idx = tabs.findIndex((t) => t.id === tabId);
      newActive = remaining[Math.min(idx, remaining.length - 1)]?.id || null;
    }
    set({ tabs: remaining, activeTabId: newActive });
  },

  setActiveTab: (tabId) => set({ activeTabId: tabId }),

  closeAll: () => set({ tabs: [], activeTabId: null }),
}));
