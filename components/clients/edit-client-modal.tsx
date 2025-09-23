"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface EditClientModalProps {
  client: any
  packages: any[]
  onClose: () => void
}

export function EditClientModal({ client, packages, onClose }: EditClientModalProps) {
  const [formData, setFormData] = useState({
    first_name: client.first_name || "",
    last_name: client.last_name || "",
    email: client.email || "",
    phone: client.phone || "",
    date_of_birth: client.date_of_birth || "",
    fitness_goals: client.fitness_goals || "",
    medical_conditions: client.medical_conditions || "",
    emergency_contact_name: client.emergency_contact_name || "",
    emergency_contact_phone: client.emergency_contact_phone || "",
    notes: client.notes || "",
    status: client.status || "active",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientPackages, setClientPackages] = useState<any[]>([])
  const [selectedPackageId, setSelectedPackageId] = useState("")
  const [packageAmount, setPackageAmount] = useState("")
  const [packagePaymentMethod, setPackagePaymentMethod] = useState("cash")
  const [packagePaymentStatus, setPackagePaymentStatus] = useState("completed")
  const [activeTab, setActiveTab] = useState("details")
  const router = useRouter()

  useEffect(() => {
    fetchClientPackages()
  }, [client.id])

  const fetchClientPackages = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("client_packages")
      .select(`
        *,
        packages(name, price, session_count, duration_days)
      `)
      .eq("client_id", client.id)
      .order("created_at", { ascending: false })

    if (!error && data) {
      setClientPackages(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase.from("clients").update(formData).eq("id", client.id)

      if (updateError) throw updateError

      router.refresh()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this client? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: deleteError } = await supabase.from("clients").delete().eq("id", client.id)

      if (deleteError) throw deleteError

      router.refresh()
      onClose()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAssignPackage = async () => {
    if (!selectedPackageId) {
      setError("Please select a package")
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const selectedPackage = packages.find(pkg => pkg.id === selectedPackageId)
      if (!selectedPackage) throw new Error("Package not found")

      // Check for existing active package of the same type
      const { data: existingPackages, error: checkError } = await supabase
        .from("client_packages")
        .select("*")
        .eq("client_id", client.id)
        .eq("package_id", selectedPackageId)
        .eq("status", "active")

      if (checkError) throw checkError

      if (existingPackages && existingPackages.length > 0) {
        throw new Error("Client already has an active package of this type")
      }

      // Calculate expiry date
      const expiryDate = new Date(Date.now() + (selectedPackage.duration_days || 30) * 24 * 60 * 60 * 1000).toISOString()

      // Create client_package record
      const { data: clientPackage, error: packageError } = await supabase
        .from("client_packages")
        .insert({
          client_id: client.id,
          package_id: selectedPackageId,
          sessions_remaining: selectedPackage.session_count,
          sessions_total: selectedPackage.session_count,
          purchase_date: new Date().toISOString(),
          expiry_date: expiryDate,
          amount_paid: Number.parseFloat(packageAmount || selectedPackage.price),
          status: "active",
        })
        .select()
        .single()

      if (packageError) throw packageError

      // Create payment record if payment status is completed
      if (packagePaymentStatus === "completed") {
        const { error: paymentError } = await supabase.from("payments").insert({
          trainer_id: user.id,
          client_id: client.id,
          amount: Number.parseFloat(packageAmount || selectedPackage.price),
          payment_method: packagePaymentMethod,
          payment_date: new Date().toISOString(),
          status: packagePaymentStatus,
          currency: "USD",
          client_package_id: clientPackage.id,
        })

        if (paymentError) throw paymentError
      }

      // Refresh the packages list
      await fetchClientPackages()

      // Reset form
      setSelectedPackageId("")
      setPackageAmount("")
      setPackagePaymentMethod("cash")
      setPackagePaymentStatus("completed")

      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getPackageStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "suspended":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Client - {client.first_name} {client.last_name}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Client Details</TabsTrigger>
            <TabsTrigger value="packages">Packages</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input
                id="first_name"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input
                id="last_name"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input
                id="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fitness_goals">Fitness Goals</Label>
            <Textarea
              id="fitness_goals"
              value={formData.fitness_goals}
              onChange={(e) => setFormData({ ...formData, fitness_goals: e.target.value })}
              placeholder="What are the client's fitness goals?"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="medical_conditions">Medical Conditions</Label>
            <Textarea
              id="medical_conditions"
              value={formData.medical_conditions}
              onChange={(e) => setFormData({ ...formData, medical_conditions: e.target.value })}
              placeholder="Any medical conditions or injuries to be aware of?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name}
                onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
              <Input
                id="emergency_contact_phone"
                type="tel"
                value={formData.emergency_contact_phone}
                onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the client"
            />
          </div>

              {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

              <div className="flex justify-between">
                <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
                  Delete Client
                </Button>
                <div className="flex space-x-3">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="packages" className="space-y-6">
            {/* Existing Packages */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Current Packages</CardTitle>
              </CardHeader>
              <CardContent>
                {clientPackages.length === 0 ? (
                  <p className="text-gray-500 text-sm">No packages assigned yet</p>
                ) : (
                  <div className="space-y-3">
                    {clientPackages.map((pkg) => (
                      <div key={pkg.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{pkg.packages?.name || "Package"}</h4>
                          <Badge className={getPackageStatusColor(pkg.status)}>
                            {pkg.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Sessions:</span>
                            <p className="text-gray-900">
                              {pkg.sessions_remaining}/{pkg.sessions_total}
                            </p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Amount Paid:</span>
                            <p className="text-gray-900">${pkg.amount_paid}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Purchase Date:</span>
                            <p className="text-gray-900">{formatDate(pkg.purchase_date)}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Expires:</span>
                            <p className="text-gray-900">{formatDate(pkg.expiry_date)}</p>
                          </div>
                        </div>
                        {new Date(pkg.expiry_date) < new Date() && (
                          <div className="mt-2 text-sm text-red-600">
                            ⚠️ This package has expired
                          </div>
                        )}
                        {pkg.sessions_remaining === 0 && pkg.status === "active" && (
                          <div className="mt-2 text-sm text-yellow-600">
                            ⚠️ No sessions remaining
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Assign New Package */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assign New Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="package">Select Package</Label>
                  <Select value={selectedPackageId} onValueChange={setSelectedPackageId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a package" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.filter(pkg => pkg.is_active).map((pkg) => (
                        <SelectItem key={pkg.id} value={pkg.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{pkg.name}</span>
                            <span className="text-gray-500 ml-2">
                              ${pkg.price} | {pkg.session_count} sessions
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPackageId && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount Paid</Label>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={packageAmount}
                          onChange={(e) => setPackageAmount(e.target.value)}
                          placeholder={packages.find(p => p.id === selectedPackageId)?.price || "0"}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="payment_method">Payment Method</Label>
                        <Select value={packagePaymentMethod} onValueChange={setPackagePaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="check">Check</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="venmo">Venmo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_status">Payment Status</Label>
                      <Select value={packagePaymentStatus} onValueChange={setPackagePaymentStatus}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                <Button
                  onClick={handleAssignPackage}
                  disabled={!selectedPackageId || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? "Assigning..." : "Assign Package"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
