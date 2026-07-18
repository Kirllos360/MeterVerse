export type EventMigrator = (payload: unknown) => unknown

export interface EventVersion {
  version: number
  changes: string
  deprecated: boolean
}

export class EventVersionManager {
  private migrations = new Map<string, EventMigrator>()
  readonly currentSchemaVersion = 1
  private _versions: EventVersion[] = [{ version: 1, changes: "Initial version", deprecated: false }]

  get versions() { return [...this._versions] }

  registerMigration(fromVersion: number, toVersion: number, migrator: EventMigrator, changes?: string): void {
    const key = `${fromVersion}->${toVersion}`
    this.migrations.set(key, migrator)
    if (!this._versions.find((v) => v.version === toVersion)) {
      this._versions.push({ version: toVersion, changes: changes || `Migration from v${fromVersion}`, deprecated: false })
    }
  }

  migrate(payload: unknown, fromVersion: number, toVersion: number): unknown {
    let current = payload
    for (let v = fromVersion; v < toVersion; v++) {
      const key = `${v}->${v + 1}`
      const migrator = this.migrations.get(key)
      if (migrator) current = migrator(current)
    }
    return current
  }

  migrateToLatest(payload: unknown, fromVersion: number): unknown {
    return this.migrate(payload, fromVersion, this.currentSchemaVersion)
  }

  needsMigration(eventVersion: number): boolean {
    return eventVersion < this.currentSchemaVersion
  }
}
