import type { StepHandler } from "../engine/workflow-engine"
import { getDataEngine } from "@/data-engine/hooks/useDataEngine"

export const conditionStep: StepHandler = async (step, context) => {
  const field = step.input?.field
  const operator = step.input?.operator
  const value = step.input?.value
  const actual = context[field || ""]

  let passed = false
  switch (operator) {
    case "eq": passed = actual === value; break
    case "neq": passed = actual !== value; break
    case "gt": passed = Number(actual) > Number(value); break
    case "gte": passed = Number(actual) >= Number(value); break
    case "lt": passed = Number(actual) < Number(value); break
    case "lte": passed = Number(actual) <= Number(value); break
    default: passed = true
  }

  return { success: true, output: { conditionPassed: passed } }
}

export const apiCallStep: StepHandler = async (step, _context) => {
  const url = step.input?.url as string
  const method = (step.input?.method as string) || "GET"
  const body = step.input?.body
  if (!url) return { success: false, error: "No URL specified" }

  try {
    const res = await fetch(url, {
      method, headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    })
    const data = await res.json()
    return { success: res.ok, output: { response: data, statusCode: res.status } }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export const createEntityStep: StepHandler = async (step, _context) => {
  const entityType = step.input?.entityType as string
  const data = (step.input?.data || {}) as Record<string, unknown>
  if (!entityType) return { success: false, error: "No entityType specified" }

  const engine = getDataEngine()
  const repoMap: Record<string, unknown> = {
    customers: engine.customers, meters: engine.meters,
    invoices: engine.invoices, readings: engine.readings,
    payments: engine.payments,
  }
  const repo = repoMap[entityType] as { create: (d: unknown) => Promise<unknown> } | undefined
  if (!repo) return { success: false, error: `Unknown entity type: ${entityType}` }

  try {
    const result = await repo.create(data)
    return { success: true, output: { entity: result, entityId: (result as Record<string, unknown>).id } }
  } catch (err) {
    return { success: false, error: String(err) }
  }
}

export const sendNotificationStep: StepHandler = async (step, _context) => {
  const title = (step.input?.title as string) || "Notification"
  const _message = (step.input?.message as string) || ""
  console.log(`[Workflow] Notification: ${title}`)
  return { success: true, output: { notified: true } }
}

export const waitStep: StepHandler = async (step) => {
  const ms = Number(step.input?.duration) || 1000
  await new Promise((r) => setTimeout(r, ms))
  return { success: true, output: { waited: ms } }
}
