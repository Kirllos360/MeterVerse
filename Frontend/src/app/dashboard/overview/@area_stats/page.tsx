import { AreaGraph } from '@/features/overview/components/area-graph';

async function getStats() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${base}/api/customers/stats`, { cache: 'no-store' });
    if (res.ok) return res.json();
  } catch {}
  return { stats: { total: 0, active: 0, inactive: 0, maintenance: 0, terminated: 0 } };
}

export default async function AreaStats() {
  const data = await getStats();
  return <AreaGraph data={data.stats || data} />;
}
