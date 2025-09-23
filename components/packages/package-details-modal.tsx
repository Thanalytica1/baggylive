"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PackageDetailsModalProps {
  package: any
  onClose: () => void
}

export function PackageDetailsModal({ package: pkg, onClose }: PackageDetailsModalProps) {
  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const activeClients = pkg.client_packages?.filter((cp: any) => cp.status === "active") || []
  const totalRevenue = pkg.client_packages?.reduce((sum: number, cp: any) => sum + (cp.amount_paid || 0), 0) || 0

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{pkg.name}</span>
            <Badge className={getStatusColor(pkg.is_active)}>{pkg.is_active ? "Active" : "Inactive"}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Package Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Package Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Price:</span>
                <p className="text-2xl font-bold text-blue-600">{formatPrice(pkg.price)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sessions Included:</span>
                <p className="text-gray-900">{pkg.session_count} sessions</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Package Duration:</span>
                <p className="text-gray-900">{pkg.duration_days} days</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Price per Session:</span>
                <p className="text-gray-900">{formatPrice(pkg.price / pkg.session_count)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-900">{formatDate(pkg.created_at)}</p>
              </div>
              {pkg.description && (
                <div>
                  <span className="font-medium text-gray-700">Description:</span>
                  <p className="text-gray-900 mt-1">{pkg.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Package Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Package Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Total Purchases:</span>
                <p className="text-gray-900">{pkg.client_packages?.length || 0}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Active Clients:</span>
                <p className="text-gray-900">{activeClients.length}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total Revenue:</span>
                <p className="text-2xl font-bold text-green-600">{formatPrice(totalRevenue)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Sessions Remaining:</span>
                <p className="text-gray-900">
                  {pkg.client_packages?.reduce((sum: number, cp: any) => sum + cp.sessions_remaining, 0) || 0}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Active Clients */}
          {activeClients.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Active Clients ({activeClients.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activeClients.map((cp: any) => (
                    <div key={cp.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {cp.clients?.first_name} {cp.clients?.last_name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {cp.sessions_remaining} of {cp.sessions_total} sessions remaining
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {Math.round((cp.sessions_remaining / cp.sessions_total) * 100)}% remaining
                          </p>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${(cp.sessions_remaining / cp.sessions_total) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
