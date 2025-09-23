"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface PaymentDetailsModalProps {
  payment: any
  onClose: () => void
}

export function PaymentDetailsModal({ payment, onClose }: PaymentDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [status, setStatus] = useState(payment.status)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: payment.currency || "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleStatusUpdate = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase.from("payments").update({ status }).eq("id", payment.id)

      if (updateError) throw updateError

      router.refresh()
      setIsEditing(false)
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this payment record? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: deleteError } = await supabase.from("payments").delete().eq("id", payment.id)

      if (deleteError) throw deleteError

      router.refresh()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Details</span>
            <Badge className={getStatusColor(payment.status)}>{payment.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Amount:</span>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Payment Method:</span>
                  <p className="text-gray-900 capitalize">{payment.payment_method?.replace("_", " ")}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-700">Payment Date:</span>
                  <p className="text-gray-900">{formatDate(payment.payment_date)}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Currency:</span>
                  <p className="text-gray-900">{payment.currency || "USD"}</p>
                </div>
              </div>
              {payment.stripe_payment_intent_id && (
                <div>
                  <span className="font-medium text-gray-700">Stripe Payment ID:</span>
                  <p className="text-gray-900 font-mono text-sm">{payment.stripe_payment_intent_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Client Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Client Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Client:</span>
                <p className="text-gray-900">
                  {payment.clients?.first_name} {payment.clients?.last_name}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{payment.clients?.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Package/Session Information */}
          {(payment.client_packages || payment.sessions) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Related Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {payment.client_packages && (
                  <div>
                    <span className="font-medium text-gray-700">Package:</span>
                    <p className="text-gray-900">{payment.client_packages.packages?.name}</p>
                  </div>
                )}
                {payment.sessions && (
                  <div>
                    <span className="font-medium text-gray-700">Session:</span>
                    <p className="text-gray-900">
                      {formatDate(payment.sessions.scheduled_at)} ({payment.sessions.duration_minutes} minutes)
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Status Update */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Status Management
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Update Status
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="font-medium text-gray-700">Status:</span>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="failed">Failed</SelectItem>
                        <SelectItem value="refunded">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-3">
                    <Button variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleStatusUpdate} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                      {isLoading ? "Updating..." : "Update Status"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">Current status: {payment.status}</p>
              )}
            </CardContent>
          </Card>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="flex justify-between">
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              Delete Payment
            </Button>
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
