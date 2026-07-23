import { PieGraph } from '@/features/overview/components/pie-graph';

async function getMeters() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${base}/api/meters`, { cache: 'no-store' });
    if (res.ok) { const d = await res.json(); return d.meters || []; }
  } catch {}
  return [];
}

export default async function PieStats() {
  const data = await getMeters();
  return <PieGraph data={data} />;
}
