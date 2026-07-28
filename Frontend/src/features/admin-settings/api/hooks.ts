import { useState, useEffect, useCallback } from "react"
import { getHealthSummary, getHealthCounters, getAuditLog, getMeterTypes, getCustomerGroups, getTariffs, getPaymentGateways, getUsers, getRoles, getBillCycles, getEvents, getErrors, getSystemSettings } from "./service"

export function useAdminData() {
  const [health, setHealth] = useState<any>(null)
  const [counters, setCounters] = useState<any>(null)
  const [audit, setAudit] = useState<any[]>([])
  const [settings, setSettings] = useState<any[]>([])
  const [meterTypes, setMeterTypes] = useState<any[]>([])
  const [customerGroups, setCustomerGroups] = useState<any[]>([])
  const [tariffs, setTariffs] = useState<any[]>([])
  const [gateways, setGateways] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [roles, setRoles] = useState<any[]>([])
  const [billCycles, setBillCycles] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [errors, setErrors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [h, c, a, s, mt, cg, t, g, u, r, bc, ev, er] = await Promise.all([
        getHealthSummary().catch(() => null),
        getHealthCounters().catch(() => null),
        getAuditLog(50).catch(() => ({ entries: [], total: 0 })),
        getSystemSettings().catch(() => ({ settings: [] })),
        getMeterTypes().catch(() => ({ types: [] })),
        getCustomerGroups().catch(() => ({ groups: [] })),
        getTariffs().catch(() => ({ tariffs: [] })),
        getPaymentGateways().catch(() => ({ gateways: [] })),
        getUsers().catch(() => ({ users: [] })),
        getRoles().catch(() => ({ roles: [] })),
        getBillCycles().catch(() => ({ cycles: [] })),
        getEvents().catch(() => ({ events: [] })),
        getErrors().catch(() => ({ errors: [] })),
      ])
      setHealth(h)
      setCounters(c)
      setAudit(a.entries)
      setSettings(s.settings)
      setMeterTypes(mt.types)
      setCustomerGroups(cg.groups)
      setTariffs(t.tariffs)
      setGateways(g.gateways)
      setUsers(u.users)
      setRoles(r.roles)
      setBillCycles(bc.cycles)
      setEvents(ev.events)
      setErrors(er.errors)
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { health, counters, audit, settings, meterTypes, customerGroups, tariffs, gateways, users, roles, billCycles, events, errors, loading, refresh }
}
