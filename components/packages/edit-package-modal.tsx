"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

interface EditPackageModalProps {
  package: any
  onClose: () => void
}

export function EditPackageModal({ package: pkg, onClose }: EditPackageModalProps) {
  const [formData, setFormData] = useState({
    name: pkg.name || "",
    description: pkg.description || "",
    session_count: pkg.session_count?.toString() || "",
    price: pkg.price?.toString() || "",
    duration_days: pkg.duration_days?.toString() || "",
    is_active: pkg.is_active ?? true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: updateError } = await supabase
        .from("packages")
        .update({
          ...formData,
          session_count: Number.parseInt(formData.session_count),
          price: Number.parseFloat(formData.price),
          duration_days: Number.parseInt(formData.duration_days),
          updated_at: new Date().toISOString(),
        })
        .eq("id", pkg.id)

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
    if (!confirm("Are you sure you want to delete this package? This action cannot be undone.")) {
      return
    }

    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error: deleteError } = await supabase.from("packages").delete().eq("id", pkg.id)

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Package</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Personal Training Package"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="session_count">Number of Sessions *</Label>
              <Input
                id="session_count"
                type="number"
                min="1"
                required
                value={formData.session_count}
                onChange={(e) => setFormData({ ...formData, session_count: e.target.value })}
                placeholder="e.g., 10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">Package Duration (days) *</Label>
              <Input
                id="duration_days"
                type="number"
                min="1"
                required
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                placeholder="e.g., 90"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's included in this package"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Package is active and available for purchase</Label>
          </div>

          {error && <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">{error}</div>}

          <div className="flex justify-between">
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isLoading}>
              Delete Package
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
      </DialogContent>
    </Dialog>
  )
}
