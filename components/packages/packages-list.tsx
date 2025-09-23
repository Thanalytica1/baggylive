"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PackageDetailsModal } from "./package-details-modal"
import { EditPackageModal } from "./edit-package-modal"

interface PackagesListProps {
  packages: any[]
}

export function PackagesList({ packages }: PackagesListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPackage, setSelectedPackage] = useState<any>(null)
  const [editingPackage, setEditingPackage] = useState<any>(null)

  const filteredPackages = packages.filter(
    (pkg) =>
      pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pkg.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  const getActiveClientsCount = (pkg: any) => {
    return pkg.client_packages?.filter((cp: any) => cp.status === "active").length || 0
  }

  return (
    <>
      <div className="mb-6">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Input
            placeholder="Search packages by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {filteredPackages.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No packages found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Create your first training package to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => (
            <Card key={pkg.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{pkg.name}</h3>
                    <p className="text-2xl font-bold text-blue-600">{formatPrice(pkg.price)}</p>
                  </div>
                  <Badge className={getStatusColor(pkg.is_active)}>{pkg.is_active ? "Active" : "Inactive"}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sessions:</span>
                    <span className="font-medium">{pkg.session_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{pkg.duration_days} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Active Clients:</span>
                    <span className="font-medium">{getActiveClientsCount(pkg)}</span>
                  </div>
                </div>

                {pkg.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{pkg.description}</p>}

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedPackage(pkg)} className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingPackage(pkg)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPackage && <PackageDetailsModal package={selectedPackage} onClose={() => setSelectedPackage(null)} />}

      {editingPackage && <EditPackageModal package={editingPackage} onClose={() => setEditingPackage(null)} />}
    </>
  )
}
