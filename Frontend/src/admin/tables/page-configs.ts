import type { PageConfig } from "./page-config"
import { customersConfigs } from "./configs/customers"
import { metersConfigs } from "./configs/meters"
import { billingConfigs } from "./configs/billing"
import { systemConfigs } from "./configs/system"
import { adminConfigs } from "./configs/admin"
import { utilityConfigs } from "./configs/utility"

export const pageConfigs: Record<string, PageConfig> = {
  ...customersConfigs,
  ...metersConfigs,
  ...billingConfigs,
  ...systemConfigs,
  ...adminConfigs,
  ...utilityConfigs,
}

