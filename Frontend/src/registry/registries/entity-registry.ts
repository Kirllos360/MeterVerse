import { BaseRegistry } from "./base-registry"
import type { Registrable } from "../contracts/base"

export type FieldType = "text" | "email" | "phone" | "number" | "currency" | "date" | "datetime" | "boolean" | "select" | "multiSelect" | "entity" | "entity[]" | "file" | "image" | "color" | "json" | "password" | "textarea" | "url"

export interface FieldOption {
  label: string
  value: unknown
  labelAr?: string
}

export interface EntityField {
  id: string
  name: string
  nameAr?: string
  type: FieldType
  required: boolean
  unique?: boolean
  defaultValue?: unknown
  placeholder?: string
  placeholderAr?: string
  options?: FieldOption[]
  showInList?: boolean
  showInCard?: boolean
  showInInspector?: boolean
}

export interface EntityRelationship {
  type: "belongsTo" | "hasMany" | "hasOne" | "belongsToMany"
  targetEntity: string
  foreignKey: string
  label: string
}

export interface EntityRegistration extends Registrable {
  domain: string
  pluralName: string
  pluralNameAr?: string
  icon: string
  fields: EntityField[]
  relationships?: EntityRelationship[]
  defaultColumns?: string[]
  searchable?: boolean
  inspectable?: boolean
  selectable?: boolean
}

export class EntityRegistry extends BaseRegistry<EntityRegistration> {
  constructor() { super("entity-registry", "Entity Registry") }

  getByDomain(domain: string): EntityRegistration[] {
    return this.getAll().filter((e) => e.domain === domain)
  }

  getFields(entityId: string): EntityField[] {
    return this.get(entityId)?.fields || []
  }

  getDefaultColumns(entityId: string): EntityField[] {
    const entity = this.get(entityId)
    if (!entity) return []
    return entity.fields.filter((f) => f.showInList !== false)
  }
}
