import { create } from "zustand"

export type MeterType = "main_water" | "child_water" | "electricity" | "gas" | "solar" | "virtual"
export type MeterStatus = "inventory" | "installed" | "active" | "suspended" | "retired"
export type SimStatus = "active" | "inactive" | "cooldown"

export interface MeterState {
  meterTypes: MeterType[]
  meterStatuses: MeterStatus[]
  simStatuses: SimStatus[]
}

export const meterRuntime = {
  types: ["main_water", "child_water", "electricity", "gas", "solar", "virtual"] as MeterType[],
  statuses: ["inventory", "installed", "active", "suspended", "retired"] as MeterStatus[],
  simStatuses: ["active", "inactive", "cooldown"] as SimStatus[],

  createDefault: () => ({
    type: "electricity" as MeterType,
    status: "inventory" as MeterStatus,
  }),
}

export const useMeterRuntime = create<MeterState>(() => ({
  meterTypes: meterRuntime.types,
  meterStatuses: meterRuntime.statuses,
  simStatuses: meterRuntime.simStatuses,
}))
