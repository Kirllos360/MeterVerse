import { NextRequest, NextResponse } from "next/server"
import { apiBackend } from "@/lib/api-client"
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { if (process.env.NEXT_PUBLIC_API_URL) { return NextResponse.json(await apiBackend("/meter-assignments/" + (await params).id)) } } catch {}
  return NextResponse.json({ assignment: null }, { status: 404 })
}
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { const body = await request.json(); if (process.env.NEXT_PUBLIC_API_URL) { return NextResponse.json(await apiBackend("/meter-assignments/" + (await params).id, { method: "PUT", body: JSON.stringify(body) })) } } catch {}
  return NextResponse.json({ error: "Update failed" }, { status: 500 })
}
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try { if (process.env.NEXT_PUBLIC_API_URL) { return NextResponse.json(await apiBackend("/meter-assignments/" + (await params).id, { method: "DELETE" })) } } catch {}
  return NextResponse.json({ success: false }, { status: 500 })
}