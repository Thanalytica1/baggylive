"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LeadDetailsModal } from "./lead-details-modal"
import { EditLeadModal } from "./edit-lead-modal"

interface LeadsListProps {
  leads: any[]
  packages: any[]
}

export function LeadsList({ leads, packages }: LeadsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sourceFilter, setSourceFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<any>(null)
  const [editingLead, setEditingLead] = useState<any>(null)

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || lead.status === statusFilter
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter

    return matchesSearch && matchesStatus && matchesSource
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-yellow-100 text-yellow-800"
      case "contacted":
        return "bg-blue-100 text-blue-800"
      case "qualified":
        return "bg-purple-100 text-purple-800"
      case "converted":
        return "bg-green-100 text-green-800"
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
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isFollowUpDue = (followUpDate: string) => {
    if (!followUpDate) return false
    return new Date(followUpDate) <= new Date()
  }

  // Get unique sources for filter
  const uniqueSources = [...new Set(leads.map((lead) => lead.source).filter(Boolean))]

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">Lead Pipeline</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
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
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="converted">Converted</SelectItem>
                  <SelectItem value="cold">Cold</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {uniqueSources.map((source) => (
                    <SelectItem key={source} value={source}>
                      {source.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredLeads.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all" || sourceFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Start by adding your first lead"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLeads.map((lead) => (
                <Card
                  key={lead.id}
                  className={`border-0 shadow-sm hover:shadow-md transition-shadow ${
                    isFollowUpDue(lead.follow_up_date) ? "ring-2 ring-orange-200" : ""
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {lead.first_name?.[0]}
                            {lead.last_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {lead.first_name} {lead.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{lead.email}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>{lead.status}</Badge>
                    </div>

                    <div className="space-y-2 mb-4">
                      {lead.phone && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span> {lead.phone}
                        </p>
                      )}
                      {lead.source && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-600">Source:</span>
                          <Badge className={getSourceColor(lead.source)} variant="outline">
                            {lead.source.replace("_", " ").replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </Badge>
                        </div>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Added:</span> {formatDate(lead.created_at)}
                      </p>
                      {lead.follow_up_date && (
                        <p
                          className={`text-sm ${
                            isFollowUpDue(lead.follow_up_date) ? "text-orange-600 font-medium" : "text-gray-600"
                          }`}
                        >
                          <span className="font-medium">Follow-up:</span> {formatDate(lead.follow_up_date)}
                          {isFollowUpDue(lead.follow_up_date) && " (Due)"}
                        </p>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)} className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingLead(lead)}>
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedLead && (
        <LeadDetailsModal lead={selectedLead} packages={packages} onClose={() => setSelectedLead(null)} />
      )}

      {editingLead && <EditLeadModal lead={editingLead} onClose={() => setEditingLead(null)} />}
    </>
  )
}
