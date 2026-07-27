"use client"

import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { EnhancedListPage } from "@/features/grid/EnhancedListPage"

export default function AdminSimPage() {
  return (
    <EnhancedListPage
      title="SIM Cards"
      description="SIM card inventory and assignments"
      chartConfigs={{
        title: "SIM Analytics",
        data1: [{name:"Jan",value:120},{name:"Feb",value:145},{name:"Mar",value:132},{name:"Apr",value:168},{name:"May",value:155},{name:"Jun",value:180}],
        data2: [{name:"Vodafone",value:320},{name:"Orange",value:210},{name:"Etisalat",value:180},{name:"WE",value:95}],
        data3: [{name:"Active",value:520},{name:"Inactive",value:85},{name:"Suspended",value:32},{name:"Retired",value:18}],
      }}
      toolbarConfig={{
        sortOptions: [{value:"iccid",label:"ICCID"},{value:"carrier",label:"Carrier"},{value:"status",label:"Status"}],
        filterOptions: [{value:"all",label:"All"},{value:"active",label:"Active"},{value:"inactive",label:"Inactive"}],
      }}
    >
      <GenericAdminPage config={pageConfigs.sim} />
    </EnhancedListPage>
  )
}
