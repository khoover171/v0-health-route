"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, FileText, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase"

interface SafetyDocument {
  id: string
  filename: string
  original_filename: string
  category: string
}

export function SafetyDocumentsDashboard() {
  const [documents, setDocuments] = useState<SafetyDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      console.log("[v0] Fetching documents from safety_documents table...")

      console.log("[v0] Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.log(
        "[v0] Supabase Anon Key (first 20 chars):",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "...",
      )

      // Test basic connection first
      const { data: connectionTest, error: connectionError } = await supabase
        .from("safety_documents")
        .select("count", { count: "exact", head: true })

      if (connectionError) {
        console.error("[v0] Connection test failed:", connectionError)
        setError(`Connection failed: ${connectionError.message}`)
        return
      }

      console.log("[v0] Connection test successful, document count:", connectionTest)

      const { data, error } = await supabase
        .from("safety_documents")
        .select("id, filename, original_filename, category")
        .order("filename", { ascending: true })

      if (error) {
        console.error("[v0] Error fetching documents:", error)
        setError(`Failed to load documents: ${error.message}`)
        return
      }

      console.log("[v0] Successfully fetched documents:", data?.length || 0)
      console.log("[v0] Sample document data:", data?.[0] || "No documents")
      setDocuments(data || [])
    } catch (err) {
      console.error("[v0] Unexpected error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(
    (doc) =>
      doc.filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.original_filename?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.category?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
      case "policies":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "sds":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "training materials":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading safety documents...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
          <Button onClick={fetchDocuments} variant="outline" className="mt-4 bg-transparent">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {documents.length}</span>
          <span>Showing: {filteredDocuments.length}</span>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No documents found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : "No safety documents available"}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredDocuments.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                    <CardTitle className="text-base truncate">{doc.original_filename}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Category</span>
                  <Badge variant="outline" className={getCategoryColor(doc.category)}>
                    {doc.category}
                  </Badge>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-muted-foreground truncate" title={doc.filename}>
                    File: {doc.filename}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
