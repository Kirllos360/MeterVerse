import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"

export interface RouteParam {
  name: string
  type: "string" | "number" | "uuid"
  required: boolean
  defaultValue?: string
}

export interface RouteRegistration extends Registrable {
  pattern: string
  programId: string
  navigable?: boolean
  parentId?: string
  params?: RouteParam[]
  icon?: string
  permissions?: string[]
}

export interface RouteMatch {
  route: RouteRegistration
  params: Record<string, string>
  score: number
}

export class RouteRegistry extends BaseRegistry<RouteRegistration> {
  constructor() { super("route-registry", "Route Registry") }

  resolve(path: string): RouteMatch | undefined {
    const parts = path.split("/").filter(Boolean)
    const matches = this.getAll().map((route) => {
      const routeParts = route.pattern.split("/").filter(Boolean)
      if (routeParts.length !== parts.length) return null
      const params: Record<string, string> = {}
      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
          params[routeParts[i].slice(1)] = parts[i]
        } else if (routeParts[i] !== parts[i]) {
          return null
        }
      }
      return { route, params, score: routeParts.length * 10 } as RouteMatch
    }).filter(Boolean) as RouteMatch[]
    return matches.sort((a, b) => b.score - a.score)[0]
  }

  generate(routeId: string, params?: Record<string, string>): string {
    const route = this.get(routeId)
    if (!route) return ""
    let path = route.pattern
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        path = path.replace(`:${key}`, value)
      }
    }
    return path
  }
}
