import { useAdminStore } from "@/stores/admin-store"

export function useLocationContext() {
  const { location } = useAdminStore()

  const locationParams = () => {
    const params = new URLSearchParams()
    if (location.selectedArea) params.set("areaId", location.selectedArea)
    if (location.selectedProject) params.set("projectId", location.selectedProject.id)
    return params.toString()
  }

  const locationQuery = () => {
    const q = locationParams()
    return q ? `?${q}` : ""
  }

  return {
    selectedArea: location.selectedArea,
    selectedProject: location.selectedProject,
    selectedZone: location.selectedZone,
    selectedUnitType: location.selectedUnitType,
    locationParams,
    locationQuery,
  }
}
