"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface LeadDetailsModalProps {
  lead: any
  packages: any[]
  onClose: () => void
}

export function LeadDetailsModal({ lead, packages, onClose }: LeadDetailsModalProps) {
  const [selectedPackage, setSelectedPackage] = useState("")
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "converted":
        return "bg-blue-100 text-blue-800"
      case "cold":
        return "bg-gray-100 text-gray-800"
      case "lost":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSourceColor = (source: string) => {
    switch (source) {
      case "referral":
        return "bg-purple-100 text-purple-800"
      case "social_media":
        return "bg-pink-100 text-pink-800"
      case "website":
        return "bg-blue-100 text-blue-800"
      case "walk_in":
        return "bg-green-100 text-green-800"
      case "advertising":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set"
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleConvertToClient = async () => {
    if (!selectedPackage) {
      setError("Please select a package for the new client")
      return
    }

    setIsConverting(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create client
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert({
          first_name: lead.first_name,
          last_name: lead.last_name,
          email: lead.email,
          phone: lead.phone,
          trainer_id: user.id,
          status: "active",
          notes: `Converted from lead. Original notes: ${lead.notes || "None"}`,
        })
        .select()
        .single()

      if (clientError) throw clientError

      // Create client package
      const selectedPkg = packages.find((pkg) => pkg.id === selectedPackage)
      if (selectedPkg) {
        const { error: packageError } = await supabase.from("client_packages").insert({
          client_id: client.id,
          package_id: selectedPackage,
          sessions_remaining: selectedPkg.session_count,
          sessions_total: selectedPkg.session_count,
          purchase_date: new Date().toISOString(),
          expiry_date: new Date(Date.now() + selectedPkg.duration_days * 24 * 60 * 60 * 1000).toISOString(),
          amount_paid: selectedPkg.price,
          status: "active",
        })

        if (packageError) throw packageError
      }

      // Update lead status to converted
      const { error: leadError } = await supabase
        .from("leads")
        .update({
          status: "converted",
          converted_to_client_id: client.id,
        })
        .eq("id", lead.id)

      if (leadError) throw leadError

      router.refresh()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {lead.first_name} {lead.last_name}
            </span>
            <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{lead.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{lead.phone || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Source:</span>
                <div className="mt-1">
                  <Badge className={getSourceColor(lead.source)} variant="outline">
                    {lead.source?.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase()) || "Unknown"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Lead Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Added:</span>
                <p className="text-gray-900">{formatDate(lead.created_at)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Follow-up Date:</span>
                <p className="text-gray-900">{formatDate(lead.follow_up_date)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Notes:</span>
                <p className="text-gray-900 mt-1">{lead.notes || "No notes added"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Convert to Client */}
          {lead.status === "active" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Convert to Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <span className="font-medium text-gray-700">Select Package:</span>
                  <Select value={selectedPackage} onValueChange={setSelectedPackage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a package for the new client" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          {pkg.name} - ${pkg.price} ({pkg.session_count} sessions)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleConvertToClient}
                  disabled={isConverting || !selectedPackage}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isConverting ? "Converting..." : "Convert to Client"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Converted Client Info */}
          {lead.status === "converted" && lead.clients && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Converted Client</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900">
                  This lead has been converted to client:{" "}
                  <span className="font-medium">
                    {lead.clients.first_name} {lead.clients.last_name}
                  </span>
                </p>
              </CardContent>
            </Card>
          )}

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
