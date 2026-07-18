import AppPageClient from "./page-client"

export default async function AppPage(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params
  return <AppPageClient slug={params.slug} />
}
