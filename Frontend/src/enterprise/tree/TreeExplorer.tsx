"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TreeNode {
  id: string
  label: string
  icon?: string
  children?: TreeNode[]
  data?: Record<string, unknown>
}

interface TreeExplorerProps {
  nodes: TreeNode[]
  selectedId?: string
  onSelect?: (node: TreeNode) => void
  onContextMenu?: (node: TreeNode, event: React.MouseEvent) => void
}

function TreeNodeItem({ node, depth, selectedId, onSelect, onContextMenu }: { node: TreeNode; depth: number; selectedId?: string; onSelect?: (node: TreeNode) => void; onContextMenu?: (node: TreeNode, event: React.MouseEvent) => void }) {
  const [expanded, setExpanded] = useState(depth < 1)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedId === node.id

  return (
    <div>
      <button
        onClick={() => { if (hasChildren) setExpanded(!expanded); onSelect?.(node) }}
        onContextMenu={(e) => onContextMenu?.(node, e)}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
        style={{
          paddingLeft: `${12 + depth * 16}px`,
          backgroundColor: isSelected ? "rgba(0,191,165,0.1)" : "transparent",
          color: isSelected ? "var(--brand-primary, #00BFA5)" : "var(--text-primary, #0A0A0A)",
        }}
        aria-selected={isSelected}
        role="treeitem"
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {hasChildren ? (
          <motion.svg animate={{ rotate: expanded ? 90 : 0 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
            <path d="M9 18l6-6-6-6" />
          </motion.svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0" style={{ color: "var(--text-tertiary, #A3A3A3)" }}>
            <circle cx="12" cy="12" r="4" />
          </svg>
        )}
        {node.icon && <span className="text-xs">{node.icon}</span>}
        <span className="truncate">{node.label}</span>
      </button>
      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }}>
            {node.children!.map((child) => (
              <TreeNodeItem key={child.id} node={child} depth={depth + 1} selectedId={selectedId} onSelect={onSelect} onContextMenu={onContextMenu} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function TreeExplorer({ nodes, selectedId, onSelect, onContextMenu }: TreeExplorerProps) {
  return (
    <div className="py-1" role="tree" aria-label="Explorer tree">
      {nodes.map((node) => (
        <TreeNodeItem key={node.id} node={node} depth={0} selectedId={selectedId} onSelect={onSelect} onContextMenu={onContextMenu} />
      ))}
    </div>
  )
}
