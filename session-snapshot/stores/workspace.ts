/* ── Workspace store — thin composition of focused stores ── */

import { useSelectionStore } from "./selection";
import { useTabsStore } from "./tabs";
import { useExplorerStore } from "./explorer";
import { useLayoutStore } from "./layout";
import { useNavigationStore } from "./navigation";

export type { EntityType } from "./selection";

/* ── Re-export individual stores for selective subscriptions ── */
export { useSelectionStore } from "./selection";
export { useTabsStore } from "./tabs";
export { useExplorerStore } from "./explorer";
export { useLayoutStore } from "./layout";
export { useNavigationStore } from "./navigation";
export type { Tab } from "./tabs";
export type { ExplorerDensity } from "./explorer";

/* ── Composite hook for backward compatibility ── */
export function useWorkspace() {
  const sel = useSelectionStore();
  const tabs = useTabsStore();
  const exp = useExplorerStore();
  const lay = useLayoutStore();
  const nav = useNavigationStore();

  return {
    /* Layout */
    explorerOpen: lay.explorerOpen,
    inspectorOpen: lay.inspectorOpen,
    explorerWidth: lay.explorerWidth,
    inspectorWidth: lay.inspectorWidth,
    setExplorerOpen: lay.setExplorerOpen,
    setInspectorOpen: lay.setInspectorOpen,
    setExplorerWidth: lay.setExplorerWidth,
    setInspectorWidth: lay.setInspectorWidth,

    /* Selection */
    activeEntityType: sel.activeEntityType,
    activeEntityId: sel.activeEntityId,
    selectedIds: sel.selectedIds,
    previewEntity: sel.previewEntity,
    selectEntity: sel.selectEntity,
    setSelectedIds: sel.setSelectedIds,
    setPreviewEntity: sel.setPreviewEntity,

    /* Tabs */
    tabs: tabs.tabs,
    activeTabId: tabs.activeTabId,
    openTab: tabs.openTab,
    closeTab: tabs.closeTab,
    setActiveTab: tabs.setActiveTab,

    /* Explorer */
    explorerSearch: exp.search,
    explorerFilter: exp.filter,
    explorerView: exp.view,
    explorerDensity: exp.density,
    explorerGroupBy: exp.groupBy,
    explorerSortBy: exp.sortBy,
    explorerSortDir: exp.sortDir,
    favorites: exp.favorites,
    pinnedIds: exp.pinnedIds,
    savedView: exp.savedView,
    setExplorerSearch: exp.setSearch,
    setExplorerFilter: exp.setFilter,
    setExplorerView: exp.setView,
    setExplorerDensity: exp.setDensity,
    setExplorerGroupBy: exp.setGroupBy,
    setExplorerSortBy: exp.setSortBy,
    setExplorerSortDir: exp.setSortDir,
    toggleFavorite: exp.toggleFavorite,
    togglePinned: exp.togglePinned,
    setSavedView: exp.setSavedView,

    /* Navigation */
    recent: nav.recent,
    addRecent: nav.addRecent,
  };
}
