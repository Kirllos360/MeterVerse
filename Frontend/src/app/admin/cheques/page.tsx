"use client"

import { useState } from "react"
import { GenericAdminPage } from "@/admin/tables/GenericAdminPage"
import { pageConfigs } from "@/admin/tables/page-configs"
import { EnhancedListPage } from "@/features/grid/EnhancedListPage"

export default function ChequesPage() {
  return (
    <EnhancedListPage
      title="Cheques"
      description="Cheque payments lifecycle (pending / cleared / rejected)"
      chartConfigs={{
        title: "Cheque Analytics",
        data1: [{name:"Pending",value:0},{name:"Cleared",value:0},{name:"Rejected",value:0}],
        data2: [{name:"Pending",value:0},{name:"Cleared",value:0}],
        data3: [{name:"Pending",value:0},{name:"Rejected",value:0}],
      }}
      toolbarConfig={{
        sortOptions: [{value:"date",label:"Date"},{value:"amount",label:"Amount"},{value:"status",label:"Status"}],
        filterOptions: [{value:"all",label:"All"},{value:"pending",label:"Pending"},{value:"completed",label:"Cleared"},{value:"rejected",label:"Rejected"}],
      }}
    >
      <GenericAdminPage config={pageConfigs.cheques} />
    </EnhancedListPage>
  )
}
