"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface SessionDetailsModalProps {
  session: any
  onClose: () => void
}

export function SessionDetailsModal({ session, onClose }: SessionDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    workout_plan: session.workout_plan || "",
    notes: session.notes || "",
    status: session.status || "scheduled",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const handleSave = async () => {
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const previousStatus = session.status

      // Check if marking as complete with a package that has no sessions remaining
      if (formData.status === "completed" && previousStatus !== "completed" && session.client_package_id) {
        const { data: clientPackage } = await supabase
          .from("client_packages")
          .select("sessions_remaining")
          .eq("id", session.client_package_id)
          .single()

        if (clientPackage && clientPackage.sessions_remaining <= 0) {
          throw new Error("Cannot mark session as completed: Package has no remaining sessions")
        }
      }

      const { error: updateError } = await supabase.from("sessions").update(formData).eq("id", session.id)

      if (updateError) throw updateError

      // Handle package count updates based on status changes
      if (session.client_package_id) {
        const { data: clientPackage } = await supabase
          .from("client_packages")
          .select("sessions_remaining")
          .eq("id", session.client_package_id)
          .single()

        if (clientPackage) {
          let newCount = clientPackage.sessions_remaining

          // Session being marked as completed (scheduled/cancelled -> completed)
          if (formData.status === "completed" && previousStatus !== "completed") {
            newCount = clientPackage.sessions_remaining - 1
          }
          // Session being uncompleted (completed -> scheduled/cancelled)
          else if (previousStatus === "completed" && formData.status !== "completed") {
            newCount = clientPackage.sessions_remaining + 1
          }
          // No change for scheduled -> cancelled or cancelled -> scheduled

          if (newCount !== clientPackage.sessions_remaining) {
            const { error: updateError } = await supabase
              .from("client_packages")
              .update({
                sessions_remaining: newCount,
              })
              .eq("id", session.client_package_id)

            if (updateError) throw updateError
          }
        }
      }

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
    if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // If session was completed and using a package, restore the session count
      if (session.client_package_id && session.status === "completed") {
        const { data: clientPackage } = await supabase
          .from("client_packages")
          .select("sessions_remaining")
          .eq("id", session.client_package_id)
          .single()

        if (clientPackage) {
          await supabase
            .from("client_packages")
            .update({
              sessions_remaining: clientPackage.sessions_remaining + 1,
            })
            .eq("id", session.client_package_id)
        }
      }

      const { error: deleteError } = await supabase.from("sessions").delete().eq("id", session.id)

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
            <span>Session Details</span>
            <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">Client:</span>
                <p className="text-gray-900">
                  {session.clients?.first_name} {session.clients?.last_name}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Scheduled:</span>
                <p className="text-gray-900">{formatDateTime(session.scheduled_at)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span>
                <p className="text-gray-900">{session.duration_minutes} minutes</p>
              </div>
              {session.client_packages && (
                <div>
                  <span className="font-medium text-gray-700">Package:</span>
                  <p className="text-gray-900">
                    {session.client_packages.packages?.name} ({session.client_packages.sessions_remaining} sessions
                    remaining)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Workout Plan & Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Workout Plan & Notes
                {!isEditing && (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="workout_plan">Workout Plan</Label>
                    <Textarea
                      id="workout_plan"
                      value={formData.workout_plan}
                      onChange={(e) => setFormData({ ...formData, workout_plan: e.target.value })}
                      placeholder="Describe the workout plan for this session"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Session notes and observations"
                      rows={3}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <span className="font-medium text-gray-700">Workout Plan:</span>
                    <p className="text-gray-900 mt-1">{session.workout_plan || "No workout plan specified"}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Notes:</span>
                    <p className="text-gray-900 mt-1">{session.notes || "No notes added"}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="flex justify-between">
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              Delete Session
            </Button>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </>
              ) : (
                <Button onClick={onClose}>Close</Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
