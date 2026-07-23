"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

interface DeleteConfirmProps {
  entity: string
  id: string
  label: string
  onClose: () => void
  onDeleted: () => void
}

export function DeleteConfirm({ entity, id, label, onClose, onDeleted }: DeleteConfirmProps) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await apiClient(`/api/${entity}/${id}`, { method: "DELETE" })
      onDeleted()
    } catch (e) {
      console.error("Delete failed", e)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Confirm Delete</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Are you sure you want to delete this {label}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  )
}
