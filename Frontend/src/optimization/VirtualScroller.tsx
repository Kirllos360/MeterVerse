"use client"

import { useState, useRef, useCallback, useEffect, type ReactNode } from "react"

interface VirtualScrollerProps<T> {
  items: T[]
  itemHeight: number
  overscan?: number
  renderItem: (item: T, index: number) => ReactNode
  onItemsRendered?: (startIndex: number, endIndex: number) => void
}

export function VirtualScroller<T>({ items, itemHeight, overscan = 5, renderItem, onItemsRendered }: VirtualScrollerProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(600)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) setContainerHeight(entry.contentRect.height)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  const handleScroll = useCallback(() => {
    if (containerRef.current) setScrollTop(containerRef.current.scrollTop)
  }, [])

  const totalHeight = items.length * itemHeight
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(items.length, Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan)
  const visibleItems = items.slice(startIndex, endIndex)
  const offsetY = startIndex * itemHeight

  useEffect(() => {
    onItemsRendered?.(startIndex, endIndex)
  }, [startIndex, endIndex, onItemsRendered])

  return (
    <div ref={containerRef} onScroll={handleScroll} className="overflow-y-auto" style={{ height: "100%", contain: "strict" }}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, transform: `translateY(${offsetY}px)`, willChange: "transform" }}>
          {visibleItems.map((item, i) => (
            <div key={startIndex + i} style={{ height: itemHeight }}>{renderItem(item, startIndex + i)}</div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function useVirtualizedList<T>(items: T[], itemHeight: number) {
  return { VirtualScroller: (props: Omit<VirtualScrollerProps<T>, "items" | "itemHeight">) => <VirtualScroller items={items} itemHeight={itemHeight} {...props} /> }
}
