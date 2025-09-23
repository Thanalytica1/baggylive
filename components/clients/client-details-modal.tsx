"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ClientDetailsModalProps {
  client: any
  onClose: () => void
}

export function ClientDetailsModal({ client, onClose }: ClientDetailsModalProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "paused":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "Not provided"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>
              {client.first_name} {client.last_name}
            </span>
            <Badge className={getStatusColor(client.status || "active")}>{client.status || "active"}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Email:</span>
                <p className="text-gray-900">{client.email || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{client.phone || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Date of Birth:</span>
                <p className="text-gray-900">{formatDate(client.date_of_birth)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Joined:</span>
                <p className="text-gray-900">{formatDate(client.created_at)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Name:</span>
                <p className="text-gray-900">{client.emergency_contact_name || "Not provided"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Phone:</span>
                <p className="text-gray-900">{client.emergency_contact_phone || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Fitness Information */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Fitness Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="font-medium text-gray-700">Fitness Goals:</span>
                <p className="text-gray-900 mt-1">{client.fitness_goals || "Not specified"}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Medical Conditions:</span>
                <p className="text-gray-900 mt-1">{client.medical_conditions || "None reported"}</p>
              </div>
              {client.notes && (
                <div>
                  <span className="font-medium text-gray-700">Notes:</span>
                  <p className="text-gray-900 mt-1">{client.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Packages */}
          {client.client_packages && client.client_packages.length > 0 && (
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Active Packages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {client.client_packages.map((clientPackage: any) => (
                    <div key={clientPackage.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{clientPackage.packages?.name || "Package"}</h4>
                        <Badge
                          className={
                            clientPackage.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }
                        >
                          {clientPackage.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Sessions Remaining:</span>
                          <p className="text-gray-900">
                            {clientPackage.sessions_remaining}/{clientPackage.sessions_total}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Amount Paid:</span>
                          <p className="text-gray-900">${clientPackage.amount_paid}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Purchase Date:</span>
                          <p className="text-gray-900">{formatDate(clientPackage.purchase_date)}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Expiry Date:</span>
                          <p className="text-gray-900">{formatDate(clientPackage.expiry_date)}</p>
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
