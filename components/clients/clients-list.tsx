"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ClientDetailsModal } from "./client-details-modal"
import { EditClientModal } from "./edit-client-modal"

interface ClientsListProps {
  clients: any[]
  packages: any[]
}

export function ClientsList({ clients, packages }: ClientsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [editingClient, setEditingClient] = useState<any>(null)

  const filteredClients = clients.filter(
    (client) =>
      `${client.first_name} ${client.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
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
            placeholder="Search clients by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clients found</h3>
            <p className="text-gray-600">
              {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first client"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => (
            <Card key={client.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {client.first_name?.[0]}
                        {client.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {client.first_name} {client.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{client.email}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(client.status || "active")}>{client.status || "active"}</Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {client.phone && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span> {client.phone}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Joined:</span> {formatDate(client.created_at)}
                  </p>
                  {client.client_packages?.length > 0 && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Active Packages:</span> {client.client_packages.length}
                    </p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedClient(client)} className="flex-1">
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setEditingClient(client)}>
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedClient && <ClientDetailsModal client={selectedClient} onClose={() => setSelectedClient(null)} />}

      {editingClient && (
        <EditClientModal client={editingClient} packages={packages} onClose={() => setEditingClient(null)} />
      )}
    </>
  )
}
