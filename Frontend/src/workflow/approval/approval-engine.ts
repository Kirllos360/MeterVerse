import { TypedEvent } from "@/runtime/kernel/events"

export interface ApprovalRequest {
  id: string
  workflowExecutionId: string
  entityType: string
  entityId: string
  summary: string
  summaryAr?: string
  approvers: { type: "role" | "user"; value: string }[]
  requiredApprovals: number
  status: "pending" | "approved" | "rejected" | "timedOut"
  decisions: ApprovalDecision[]
  createdAt: number
  completedAt?: number
}

export interface ApprovalDecision {
  userId: string
  userName: string
  decision: "approved" | "rejected"
  comment?: string
  decidedAt: number
}

export class ApprovalEngine {
  private requests = new Map<string, ApprovalRequest>()
  onApprovalCreated = new TypedEvent<ApprovalRequest>()
  onApprovalCompleted = new TypedEvent<ApprovalRequest>()

  createRequest(options: Omit<ApprovalRequest, "id" | "status" | "decisions" | "createdAt">): ApprovalRequest {
    const request: ApprovalRequest = { id: `apr_${Date.now()}`, status: "pending", decisions: [], createdAt: Date.now(), ...options }
    this.requests.set(request.id, request)
    this.onApprovalCreated.dispatch(request)
    return request
  }

  approve(requestId: string, userId: string, userName: string, comment?: string): ApprovalRequest | undefined {
    const request = this.requests.get(requestId)
    if (!request || request.status !== "pending") return undefined
    request.decisions.push({ userId, userName, decision: "approved", comment, decidedAt: Date.now() })
    if (request.decisions.filter((d) => d.decision === "approved").length >= request.requiredApprovals) {
      request.status = "approved"
      request.completedAt = Date.now()
      this.onApprovalCompleted.dispatch(request)
    }
    return request
  }

  reject(requestId: string, userId: string, userName: string, reason: string): ApprovalRequest | undefined {
    const request = this.requests.get(requestId)
    if (!request || request.status !== "pending") return undefined
    request.decisions.push({ userId, userName, decision: "rejected", comment: reason, decidedAt: Date.now() })
    request.status = "rejected"
    request.completedAt = Date.now()
    this.onApprovalCompleted.dispatch(request)
    return request
  }

  getRequest(id: string): ApprovalRequest | undefined { return this.requests.get(id) }
  getPendingByUser(userId: string): ApprovalRequest[] {
    return Array.from(this.requests.values()).filter((r) => r.status === "pending" && r.approvers.some((a) => a.value === userId))
  }
  getAll(): ApprovalRequest[] { return Array.from(this.requests.values()) }
}
