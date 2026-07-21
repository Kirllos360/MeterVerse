"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Icons } from "@/components/icons"

interface Setting { id: string; key: string; value: string; category: string; type: string }

const CATEGORIES = ["general", "security", "email", "billing", "features", "upload"]

export default function AdminsettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [category, setCategory] = useState("general")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [edited, setEdited] = useState<Record<string, string>>({})

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/settings?category=${category}`).then((r) => r.json()).then((d) => { setSettings(d.settings || []); setLoading(false) }).catch(() => setLoading(false))
  }, [category])

  const handleSave = async () => {
    setSaving(true)
    const updates = settings.map((s) => ({ key: s.key, value: edited[s.key] ?? s.value, category: s.category, type: s.type }))
    try { await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ settings: updates }) }) } catch {}
    setSaving(false); setEdited({})
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure system-wide settings</p>
        </div>
        {Object.keys(edited).length > 0 && (
          <Button onClick={handleSave} disabled={saving}>
            <Icons.check className="mr-2 h-4 w-4" />{saving ? "Saving..." : `Save Changes (${Object.keys(edited).length})`}
          </Button>
        )}
      </div>

      <Tabs value={category} onValueChange={setCategory}>
        <TabsList>
          {CATEGORIES.map(c => <TabsTrigger key={c} value={c} className="capitalize">{c}</TabsTrigger>)}
        </TabsList>
        {CATEGORIES.map(c => (
          <TabsContent key={c} value={c} className="space-y-0">
            <Card>
              {loading ? (
                <CardContent className="py-8 text-center text-sm text-muted-foreground">Loading...</CardContent>
              ) : settings.length === 0 ? (
                <CardContent className="py-8 text-center text-sm text-muted-foreground">No settings in this category</CardContent>
              ) : (
                <div className="divide-y">
                  {settings.map((s) => {
                    const isEdited = edited[s.key] !== undefined && edited[s.key] !== s.value
                    return (
                      <div key={s.key} className="flex items-center justify-between px-4 py-3 text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{s.key.split(".").pop()?.replace(/_/g, " ")}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-0.5">{s.key}</div>
                        </div>
                        <div className="w-64">
                          <Input value={edited[s.key] ?? s.value} onChange={(e) => setEdited({ ...edited, [s.key]: e.target.value })} className={isEdited ? "border-primary" : ""} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
