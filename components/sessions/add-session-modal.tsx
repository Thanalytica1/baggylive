"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface AddSessionModalProps {
  clients: any[]
  onClose: () => void
}

export function AddSessionModal({ clients, onClose }: AddSessionModalProps) {
  const [formData, setFormData] = useState({
    client_id: "",
    client_package_id: "",
    scheduled_at: "",
    duration_minutes: "60",
    workout_plan: "",
    notes: "",
    status: "scheduled",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const selectedClient = clients.find((client) => client.id === formData.client_id)
  const availablePackages =
    selectedClient?.client_packages?.filter((cp: any) => cp.status === "active" && cp.sessions_remaining > 0) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Create session
      const { error: sessionError } = await supabase.from("sessions").insert({
        ...formData,
        trainer_id: user.id,
        duration_minutes: Number.parseInt(formData.duration_minutes),
      })

      if (sessionError) throw sessionError

      // If using a package, decrement sessions remaining
      if (formData.client_package_id) {
        const { data: clientPackage } = await supabase
          .from("client_packages")
          .select("sessions_remaining")
          .eq("id", formData.client_package_id)
          .single()

        if (clientPackage) {
          const { error: updateError } = await supabase
            .from("client_packages")
            .update({
              sessions_remaining: clientPackage.sessions_remaining - 1,
            })
            .eq("id", formData.client_package_id)

          if (updateError) throw updateError
        }
      }

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule New Session</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) => setFormData({ ...formData, client_id: value, client_package_id: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.first_name} {client.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_package_id">Package (Optional)</Label>
              <Select
                value={formData.client_package_id}
                onValueChange={(value) => setFormData({ ...formData, client_package_id: value })}
                disabled={!selectedClient}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a package" />
                </SelectTrigger>
                <SelectContent>
                  {availablePackages.map((cp: any) => (
                    <SelectItem key={cp.id} value={cp.id}>
                      {cp.packages?.name} ({cp.sessions_remaining} sessions left)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_at">Date & Time *</Label>
              <Input
                id="scheduled_at"
                type="datetime-local"
                required
                value={formData.scheduled_at}
                onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duration (minutes) *</Label>
              <Select
                value={formData.duration_minutes}
                onValueChange={(value) => setFormData({ ...formData, duration_minutes: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">60 minutes</SelectItem>
                  <SelectItem value="90">90 minutes</SelectItem>
                  <SelectItem value="120">120 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workout_plan">Workout Plan</Label>
            <Textarea
              id="workout_plan"
              value={formData.workout_plan}
              onChange={(e) => setFormData({ ...formData, workout_plan: e.target.value })}
              placeholder="Describe the planned workout for this session"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes for this session"
              rows={2}
            />
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? "Scheduling..." : "Schedule Session"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
