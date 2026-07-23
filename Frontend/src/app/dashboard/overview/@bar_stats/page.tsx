import { BarGraph } from '@/features/overview/components/bar-graph';

async function getReadings() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${base}/api/readings?limit=30`, { cache: 'no-store' });
    if (res.ok) { const d = await res.json(); return d.readings || []; }
  } catch {}
  return [];
}

export default async function BarStats() {
  const data = await getReadings();
  return <BarGraph data={data} />;
}
