"use client"

import { useState } from "react"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { RuntimeEngine, sampleEntities } from "@/admin/runtime/RuntimeEngine"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function AdminRuntimePage() {
  const [entityName, setEntityName] = useState("customer")
  const [tab, setTab] = useState("demo")

  const metadata = sampleEntities[entityName]

  return (
    <GenericAdminPage config={pageConfigs.runtime} renderCustom={() => (
      <div className="space-y-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="metadata">Entity Definitions</TabsTrigger>
            <TabsTrigger value="schema">Schema Reference</TabsTrigger>
          </TabsList>

          <div className="flex gap-2 flex-wrap">
            {Object.keys(sampleEntities).map(key => (
              <Button key={key} variant={entityName === key ? "default" : "outline"} size="sm" onClick={() => setEntityName(key)} className="capitalize">
                {sampleEntities[key].labelPlural}
              </Button>
            ))}
          </div>

          <TabsContent value="demo" className="space-y-0">
            {metadata && <RuntimeEngine metadata={metadata} key={entityName} />}
          </TabsContent>

          <TabsContent value="metadata" className="space-y-0">
            <Card>
              <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">{metadata.label} — Entity Definition</div>
              <CardContent>
                <pre className="text-xs font-mono overflow-auto max-h-96 text-muted-foreground">{JSON.stringify(metadata, null, 2)}</pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schema" className="space-y-0">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">FieldDef</div>
                <CardContent>
                  <pre className="text-xs font-mono text-muted-foreground">{`{
  name: string
  label: string
  type: string  // string | number | boolean | date | email | enum | textarea
  required?: boolean
  readonly?: boolean
  placeholder?: string
  defaultValue?: any
  options?: {label, value}[]
  min?: number
  max?: number
  pattern?: string
  description?: string
}`}</pre>
                </CardContent>
              </Card>
              <Card>
                <div className="px-4 py-3 border-b text-sm font-medium text-muted-foreground">EntityMetadata</div>
                <CardContent>
                  <pre className="text-xs font-mono text-muted-foreground">{`{
  name: string
  label: string
  labelPlural: string
  description?: string
  fields: FieldDef[]
  columns?: string[]
  formFields?: string[]
  actions?: ActionDef[]
  permissions?: {create, read, update, delete}
  defaultSort?: string
}

ActionDef: {
  name, label, icon?, color?,
  confirm?, requirePermission?,
  handler: "delete"|"approve"|"export"|"custom"
}`}</pre>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )} />
  )
}
