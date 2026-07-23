"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  assigneeId: string | null
  customerId: string | null
  dueDate: string | null
  createdAt: string
  assignee?: { id: string; name: string; email: string }
  customer?: { id: string; name: string }
}

const STATUS_COLUMNS = ["todo", "in_progress", "review", "done"]

const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  review: "Review",
  done: "Done",
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
}

function PriorityBadge({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority] || "bg-gray-100 text-gray-800"
  return <Badge className={color}>{priority}</Badge>
}

export default function AdminTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedTask, setDraggedTask] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient<{ tasks: Task[] }>("/api/tasks?limit=100")
        setTasks(res.tasks)
      } catch (e) {
        console.error("Failed to load tasks", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function updateStatus(taskId: string, newStatus: string) {
    try {
      await apiClient(`/api/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
        headers: { "Content-Type": "application/json" },
      })
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)))
    } catch (e) {
      console.error("Failed to update task", e)
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {STATUS_COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col)
          return (
            <div
              key={col}
              className="bg-muted/30 rounded-lg p-3 min-h-[300px]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedTask) {
                  updateStatus(draggedTask, col)
                  setDraggedTask(null)
                }
              }}
            >
              <h2 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                {STATUS_LABELS[col]} ({columnTasks.length})
              </h2>
              <div className="space-y-2">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={() => setDraggedTask(task.id)}
                    className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm leading-tight">{task.title}</p>
                        <PriorityBadge priority={task.priority} />
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                        <span>{task.assignee?.name || "Unassigned"}</span>
                        {task.dueDate && (
                          <span className={new Date(task.dueDate) < new Date() ? "text-red-500 font-medium" : ""}>
                            {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {columnTasks.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No tasks</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
