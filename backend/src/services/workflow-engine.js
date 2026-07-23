import { prisma } from "../db.js"

const STATE_MACHINES = {
  customer: {
    states: ["lead", "created", "verified", "active", "suspended", "closed", "archived"],
    transitions: {
      lead: ["created", "archived"],
      created: ["verified", "archived"],
      verified: ["active", "suspended"],
      active: ["suspended", "closed"],
      suspended: ["active", "closed"],
      closed: ["archived"],
      archived: [],
    },
  },
  invoice: {
    states: ["draft", "pending", "approved", "issued", "partially_paid", "paid", "cancelled", "archived"],
    transitions: {
      draft: ["pending", "cancelled"],
      pending: ["approved", "cancelled"],
      approved: ["issued", "cancelled"],
      issued: ["partially_paid", "paid", "cancelled"],
      partially_paid: ["paid", "cancelled"],
      paid: ["archived"],
      cancelled: ["archived"],
      archived: [],
    },
  },
  meter: {
    states: ["stock", "assigned", "installed", "reading", "disconnected", "maintenance", "retired"],
    transitions: {
      stock: ["assigned"],
      assigned: ["installed", "stock"],
      installed: ["reading", "maintenance", "disconnected"],
      reading: ["disconnected", "maintenance", "retired"],
      disconnected: ["reading", "maintenance", "retired"],
      maintenance: ["reading", "retired"],
      retired: [],
    },
  },
}

export function getValidTransitions(entityType, currentState) {
  const machine = STATE_MACHINES[entityType]
  if (!machine) return { valid: false, error: `Unknown entity type: ${entityType}` }
  const transitions = machine.transitions[currentState]
  if (!transitions) return { valid: false, error: `Unknown state: ${currentState} for ${entityType}` }
  return { valid: true, transitions }
}

export function validateTransition(entityType, currentState, targetState) {
  const machine = STATE_MACHINES[entityType]
  if (!machine) return { valid: false, error: `Unknown entity type: ${entityType}` }
  const allowed = machine.transitions[currentState]
  if (!allowed) return { valid: false, error: `Unknown state: ${currentState}` }
  if (!allowed.includes(targetState)) {
    return {
      valid: false,
      error: `Cannot transition ${entityType} from '${currentState}' to '${targetState}'`,
      allowedTransitions: allowed,
    }
  }
  return { valid: true }
}

export async function transition(entityType, entityId, targetState, actorId) {
  const current = await prisma.workflowState.findFirst({
    where: { entityType, entityId, current: true },
    orderBy: { createdAt: "desc" },
  })
  const currentState = current?.state || "lead"

  const validation = validateTransition(entityType, currentState, targetState)
  if (!validation.valid) return { success: false, error: validation.error }

  if (current) await prisma.workflowState.update({ where: { id: current.id }, data: { current: false } })
  const next = await prisma.workflowState.create({
    data: { entityType, entityId, state: targetState, current: true, enteredBy: actorId },
  })
  await prisma.auditEntry.create({
    data: { action: `${entityType}.state_change`, actorId, resource: entityType, resourceId: entityId, details: JSON.stringify({ from: currentState, to: targetState }) },
  })
  return { success: true, from: currentState, to: targetState, state: next }
}
