import { RecentSales } from '@/features/overview/components/recent-sales';

async function getInvoices() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const res = await fetch(`${base}/api/invoices?limit=10`, { cache: 'no-store' });
    if (res.ok) { const d = await res.json(); return d.invoices || []; }
  } catch {}
  return [];
}

export default async function Sales() {
  const data = await getInvoices();
  return <RecentSales data={data} />;
}
