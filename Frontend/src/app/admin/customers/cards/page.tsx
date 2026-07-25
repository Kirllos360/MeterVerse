"use client"

import { useState, useEffect, useMemo } from "react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface CustomerCard {
  id: string; name: string; email?: string; phone?: string; area?: string; status: string;
  address?: string; _count?: { meters?: number; invoices?: number }; meters?: number; createdAt?: string;
}

const ROWS_PER_PAGE = 12;

export default function CustomerCardsPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = () => {
    setLoading(true);
    setError(null);
    apiClient<{ customers: CustomerCard[] }>("/api/customers")
      .then(d => { setCustomers(d.customers || []); setLoading(false); })
      .catch(e => { setError(e.message || "Failed to load"); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search) return customers;
    const q = search.toLowerCase();
    return customers.filter(c =>
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.area || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q)
    );
  }, [customers, search]);

  useEffect(() => { setPage(1) }, [search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paged = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  if (loading) return <div className="p-6 space-y-4"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><Skeleton className="h-44" /><Skeleton className="h-44" /><Skeleton className="h-44" /></div></div>;

  if (error) return <div className="p-6 text-center space-y-4"><p className="text-destructive text-lg">⚠ Failed to load customers</p><p className="text-sm text-muted-foreground">{error}</p><Button variant="outline" onClick={load}>Retry</Button></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="text-2xl font-bold">Customers</h1><p className="text-sm text-muted-foreground">{filtered.length} customers</p></div>
        <div className="flex gap-2">
          <Input placeholder="Search..." className="w-64" value={search} onChange={e => setSearch(e.target.value)} />
          <Button variant="outline" onClick={() => router.push("/admin")}>Back</Button>
        </div>
      </div>

      {paged.length === 0 && <div className="text-center py-16"><p className="text-muted-foreground text-lg">No customers found</p><p className="text-sm text-muted-foreground mt-1">{search ? "Try a different search term." : "Create a customer to get started."}</p></div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paged.map(c => (
          <Card key={c.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push(`/admin/customers/${c.id}`)}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{c.name}</CardTitle>
                <Badge variant={c.status === "active" ? "default" : "secondary"}>{c.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-1.5 text-sm">
              <p><span className="text-muted-foreground">Email:</span> {c.email || "—"}</p>
              <p><span className="text-muted-foreground">Phone:</span> {c.phone || "—"}</p>
              <p><span className="text-muted-foreground">Area:</span> {c.area || "—"}</p>
              <p><span className="text-muted-foreground">Address:</span> {c.address || "—"}</p>
              <p><span className="text-muted-foreground">Meters:</span> {c._count?.meters ?? c.meters ?? 0}</p>
              <p><span className="text-muted-foreground">Created:</span> {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      )}
    </div>
  );
}
