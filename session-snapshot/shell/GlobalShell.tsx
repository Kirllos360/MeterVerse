"use client";
import { useEffect, useCallback, useRef, useState } from "react";
import { cn } from "@/v2/lib/cn";
import { useWorkspace } from "@/v2/stores/workspace";
import { useSearch } from "@/v2/stores/search";
import { useCommandPalette } from "@/v2/stores/commands";
import { Explorer } from "@/v2/components/explorer/Explorer";
import { Workspace } from "@/v2/components/workspace/Workspace";
import { Inspector } from "@/v2/components/inspector/Inspector";
import { CommandPalette } from "@/v2/components/ui/command-palette";
import { CommandPaletteGroup, CommandPaletteItem } from "@/v2/components/ui/command-palette";
import { SearchModal } from "@/v2/components/search/SearchModal";
import { ErrorBoundary } from "@/v2/components/ui/error-boundary";
import { Search, Bell, Command, LayoutDashboard, Users, Zap, FileText, CreditCard, Database, Settings, PanelLeft, PanelRight, ChevronDown } from "lucide-react";

const MIN_EW = 360, MAX_EW = 460, DEF_EW = 390;
const MIN_IW = 340, MAX_IW = 420, DEF_IW = 380;
const STORAGE_KEY = "mvos-layout-v4";

function loadWidths() {
  if (typeof window === "undefined") return { e: DEF_EW, i: DEF_IW };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { e: DEF_EW, i: DEF_IW };
    const p = JSON.parse(raw);
    return {
      e: Math.max(MIN_EW, Math.min(MAX_EW, Number(p.e) || DEF_EW)),
      i: Math.max(MIN_IW, Math.min(MAX_IW, Number(p.i) || DEF_IW)),
    };
  } catch { return { e: DEF_EW, i: DEF_IW }; }
}
function saveWidths(e: number, i: number) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ e, i })); } catch {} }

export function GlobalShell() {
  const ws = useWorkspace();
  const search = useSearch();
  const cmd = useCommandPalette();
  const [w, setW] = useState({ e: DEF_EW, i: DEF_IW });
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { const loaded = loadWidths(); setW(loaded); setHydrated(true); }, []);

  const hk = useCallback((e: KeyboardEvent) => {
    const m = e.metaKey || e.ctrlKey;
    if (m && e.key === "k") { e.preventDefault(); cmd.setOpen(!cmd.open); }
    if (m && e.key === "p") { e.preventDefault(); search.setOpen(!search.open); }
    if (m && e.key === "b") { e.preventDefault(); ws.setExplorerOpen(!ws.explorerOpen); }
    if (m && e.key === "i") { e.preventDefault(); ws.setInspectorOpen(!ws.inspectorOpen); }
  }, [cmd, search, ws]);

  useEffect(() => { window.addEventListener("keydown", hk); return () => window.removeEventListener("keydown", hk); }, [hk]);

  const nav = (path: string) => { window.location.href = path; cmd.setOpen(false); };

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[var(--bg)]">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Header onSearch={() => search.setOpen(true)} onCmd={() => cmd.setOpen(true)} />
          <div className="flex flex-1 overflow-hidden">
            {ws.explorerOpen && (
              <>
                <div className="flex flex-col h-full bg-[var(--bg-raised)] border-r border-[var(--border)] shrink-0" style={{ width: w.e }}>
                  <ErrorBoundary name="Explorer"><Explorer /></ErrorBoundary>
                </div>
                <Handle onDrag={(dx) => setW(p => { const e = Math.max(MIN_EW, Math.min(MAX_EW, p.e + dx)); saveWidths(e, p.i); return { ...p, e }; })} />
              </>
            )}
            <div className="flex-1 min-w-0 bg-[var(--bg)]"><ErrorBoundary name="Workspace"><Workspace /></ErrorBoundary></div>
            {ws.inspectorOpen && (
              <>
                <Handle onDrag={(dx) => setW(p => { const i = Math.max(MIN_IW, Math.min(MAX_IW, p.i - dx)); saveWidths(p.e, i); return { ...p, i }; })} />
                <div className="flex flex-col h-full bg-[var(--bg-raised)] border-l border-[var(--border)] shrink-0" style={{ width: w.i }}>
                  <ErrorBoundary name="Inspector"><Inspector /></ErrorBoundary>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CommandPalette open={cmd.open} onOpenChange={cmd.setOpen} placeholder="Type a command...">
        <CommandPaletteGroup heading="Navigation">
          {[
            { l: "Dashboard", i: LayoutDashboard, a: () => nav("/v2") },
            { l: "Customers", i: Users, a: () => nav("/v2/customers") },
            { l: "Meters", i: Zap, a: () => nav("/v2/meters") },
            { l: "Invoices", i: FileText, a: () => nav("/v2/invoices") },
            { l: "Payments", i: CreditCard, a: () => nav("/v2/payments") },
            { l: "Settings", i: Settings, a: () => nav("/v2/settings") },
          ].map((x) => (
            <CommandPaletteItem key={x.l} onSelect={x.a}><x.i size={16} className="text-[var(--text-tertiary)]" /> {x.l}</CommandPaletteItem>
          ))}
        </CommandPaletteGroup>
        <CommandPaletteGroup heading="Actions">
          {["Create Customer", "Create Meter", "Record Reading", "Generate Invoice"].map((l) => (
            <CommandPaletteItem key={l} onSelect={() => nav("/v2/customers")}>{l}</CommandPaletteItem>
          ))}
        </CommandPaletteGroup>
      </CommandPalette>
      <SearchModal />
    </>
  );
}

function Handle({ onDrag }: { onDrag: (dx: number) => void }) {
  const d = useRef(false);
  const sx = useRef(0);
  const md = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); d.current = true; sx.current = e.clientX;
    const mv = (ev: MouseEvent) => { if (!d.current) return; const dx = ev.clientX - sx.current; if (Math.abs(dx) > 2) { onDrag(dx); sx.current = ev.clientX; } };
    const up = () => { d.current = false; window.removeEventListener("mousemove", mv); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", mv); window.addEventListener("mouseup", up);
  }, [onDrag]);
  return <div className="relative w-[3px] cursor-col-resize shrink-0 group z-10" onMouseDown={md}><div className="absolute inset-0 bg-transparent group-hover:bg-[var(--border-hover)] transition-colors duration-120" /><div className="absolute inset-y-0 -left-1 -right-1" /></div>;
}

function Sidebar() {
  const ws = useWorkspace();
  return (
    <div className="flex flex-col items-center w-12 min-w-[48px] border-r border-[var(--border)] bg-[var(--bg-raised)] py-3 gap-1 shrink-0">
      <div className="w-8 h-8 rounded-[var(--radius-8)] bg-black dark:bg-white flex items-center justify-center mb-4 transition-transform duration-120 hover:scale-105">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="dark:stroke-black"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
      <nav className="flex flex-col gap-0.5 flex-1">
        {[{ id:"customer" as const, label:"Customers", icon:Users }, { id:"meter" as const, label:"Meters", icon:Zap }, { id:"invoice" as const, label:"Invoices", icon:FileText }, { id:"payment" as const, label:"Payments", icon:CreditCard }, { id:"reading" as const, label:"Readings", icon:Database }].map((item) => {
          const Icon = item.icon;
          const act = ws.activeEntityType === item.id;
          return (
            <button key={item.id} onClick={() => ws.selectEntity(item.id, ws.activeEntityId || "")}
              className={cn("relative w-8 h-8 rounded-[var(--radius-8)] flex items-center justify-center transition-all duration-120", act ? "bg-[var(--bg-hover)] text-[var(--text)] after:absolute after:left-0 after:top-1/2 after:-translate-y-1/2 after:w-[3px] after:h-4 after:rounded-r-full after:bg-[var(--text)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")}
              title={item.label}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </nav>
      <div className="flex flex-col gap-0.5">
        <button onClick={() => ws.setExplorerOpen(!ws.explorerOpen)} className={cn("w-8 h-8 rounded-[var(--radius-8)] flex items-center justify-center transition-all duration-120", ws.explorerOpen ? "text-[var(--text)] bg-[var(--bg-hover)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")} title="Toggle Explorer (Cmd+B)"><PanelLeft size={16} /></button>
        <button onClick={() => ws.setInspectorOpen(!ws.inspectorOpen)} className={cn("w-8 h-8 rounded-[var(--radius-8)] flex items-center justify-center transition-all duration-120", ws.inspectorOpen ? "text-[var(--text)] bg-[var(--bg-hover)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]")} title="Toggle Inspector (Cmd+I)"><PanelRight size={16} /></button>
      </div>
    </div>
  );
}

function Header({ onSearch, onCmd }: { onSearch: () => void; onCmd: () => void }) {
  const ws = useWorkspace();
  const labels: Record<string, string> = { customer:"Customers", meter:"Meters", invoice:"Invoices", payment:"Payments", reading:"Readings" };
  return (
    <div className="flex items-center justify-between h-11 px-4 border-b border-[var(--border)] bg-[var(--bg-raised)] shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <button onClick={onCmd} className="flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-6)] text-[var(--font-caption)] text-[var(--text-tertiary)] border border-[var(--border)] hover:border-[var(--border-hover)] hover:text-[var(--text-secondary)] transition-all duration-120 shrink-0">
          <Command size={13} /><span>K</span>
        </button>
        <div className="flex items-center gap-2 text-[var(--font-caption)] min-w-0">
          <span className="text-[var(--text-tertiary)] shrink-0">MeterVerse</span>
          <span className="text-[var(--text-tertiary)]">/</span>
          <span className="text-[var(--text)] font-medium truncate">{labels[ws.activeEntityType] || "Dashboard"}</span>
          {ws.activeEntityId && <><span className="text-[var(--text-tertiary)]">/</span><span className="text-[var(--text-secondary)] truncate">Detail</span></>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onSearch} className="w-7 h-7 rounded-[var(--radius-6)] hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-tertiary)] transition-all duration-120" title="Search (Ctrl+P)"><Search size={14} /></button>
        <button className="relative w-7 h-7 rounded-[var(--radius-6)] hover:bg-[var(--bg-hover)] flex items-center justify-center text-[var(--text-tertiary)] transition-all duration-120" title="Notifications"><Bell size={14} /><span className="absolute top-1.5 right-1.5 w-[5px] h-[5px] rounded-full bg-[var(--red)] ring-2 ring-[var(--bg-raised)]" /></button>
      </div>
    </div>
  );
}
