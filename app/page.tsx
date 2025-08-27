"use client"
export const dynamic = 'force-dynamic'
export const revalidate = 0
import { SafetyDocumentsDashboard } from "@/components/safety-documents-dashboard"

// Deployment trigger comment - updated for Supabase connection - 2025-01-27
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Safety Documents Dashboard</h1>
          <p className="text-muted-foreground mt-2">Manage and track your safety documentation</p>
        </div>
        <SafetyDocumentsDashboard />
      </div>
    </main>
  )
}
