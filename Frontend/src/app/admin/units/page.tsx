"use client"

import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { EnhancedListPage } from "@/features/grid/EnhancedListPage"

export default function AdminUnitsPage() {
  return (
    <EnhancedListPage
      title="Units"
      description="Manage units within zones"
      chartConfigs={{
        title: "Unit Analytics",
        data1: [{name:"Jan",value:45},{name:"Feb",value:52},{name:"Mar",value:48},{name:"Apr",value:63},{name:"May",value:58},{name:"Jun",value:72}],
        data2: [{name:"Residential",value:320},{name:"Commercial",value:120},{name:"Industrial",value:45}],
        data3: [{name:"Occupied",value:380},{name:"Vacant",value:72},{name:"Maintenance",value:25},{name:"Reserved",value:8}],
      }}
      toolbarConfig={{
        sortOptions: [{value:"name",label:"Name"},{value:"zone",label:"Zone"},{value:"status",label:"Status"}],
        filterOptions: [{value:"all",label:"All"},{value:"occupied",label:"Occupied"},{value:"vacant",label:"Vacant"}],
      }}
    >
      <GenericAdminPage config={pageConfigs["units"]} />
    </EnhancedListPage>
  )
}
