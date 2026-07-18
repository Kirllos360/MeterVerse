export interface EventFilter {
  types?: string[]
  excludeTypes?: string[]
  categories?: string[]
  tags?: string[]
  sourceTypes?: string[]
  priorityRange?: { min?: number; max?: number }
  timeRange?: { after?: number; before?: number }
  predicate?: (event: Record<string, unknown>) => boolean
}

export class EventFilterEngine {
  matches(event: Record<string, unknown>, filter: EventFilter): boolean {
    const type = event.type as string
    const priority = event.priority as number
    const timestamp = event.timestamp as number
    const source = event.source as { type: string; tags?: string[] }

    if (filter.types && !filter.types.some((t) => type.startsWith(t))) return false
    if (filter.excludeTypes && filter.excludeTypes.some((t) => type.startsWith(t))) return false
    if (filter.priorityRange) {
      if (filter.priorityRange.min !== undefined && priority < filter.priorityRange.min) return false
      if (filter.priorityRange.max !== undefined && priority > filter.priorityRange.max) return false
    }
    if (filter.timeRange) {
      if (filter.timeRange.after !== undefined && timestamp < filter.timeRange.after) return false
      if (filter.timeRange.before !== undefined && timestamp > filter.timeRange.before) return false
    }
    if (filter.sourceTypes && !filter.sourceTypes.includes(source?.type)) return false
    if (filter.predicate && !filter.predicate(event)) return false

    return true
  }

  and(...filters: EventFilter[]): EventFilter {
    return {
      predicate: (event) => filters.every((f) => this.matches(event, f)),
    }
  }

  or(...filters: EventFilter[]): EventFilter {
    return {
      predicate: (event) => filters.some((f) => this.matches(event, f)),
    }
  }
}
