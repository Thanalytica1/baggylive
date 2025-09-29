"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function BusinessSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    business_name: "",
    business_description: "",
    session_duration: "60",
    currency: "USD",
    timezone: "America/New_York",
    auto_reminders: true,
    reminder_hours: "24",
  })
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (data) {
        setSettings(prev => ({
          ...prev,
          business_name: data.business_name || "",
          business_description: data.business_description || "",
          // These would come from a settings table in a real app
        }))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateSettings() {
    setSaving(true)
    setMessage("")

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push("/auth/login")
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          business_name: settings.business_name,
          business_description: settings.business_description,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error
      setMessage("Settings updated successfully!")

      // Refresh the page to update header
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error) {
      console.error("Error updating settings:", error)
      setMessage("Error updating settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Business Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure your business preferences and defaults
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Basic information about your training business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              value={settings.business_name}
              onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
              placeholder="Your Fitness Studio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Business Description</Label>
            <Textarea
              id="description"
              value={settings.business_description}
              onChange={(e) => setSettings({ ...settings, business_description: e.target.value })}
              placeholder="Describe your training services and specialties..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Defaults</CardTitle>
          <CardDescription>
            Default settings for new sessions and packages
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Default Session Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  value={settings.session_duration}
                  onChange={(e) => setSettings({ ...settings, session_duration: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
                <option value="AUD">AUD ($)</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <select
              id="timezone"
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="America/New_York">Eastern Time (US)</option>
              <option value="America/Chicago">Central Time (US)</option>
              <option value="America/Denver">Mountain Time (US)</option>
              <option value="America/Los_Angeles">Pacific Time (US)</option>
              <option value="Europe/London">London (UK)</option>
              <option value="Europe/Paris">Paris (France)</option>
              <option value="Australia/Sydney">Sydney (Australia)</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure automatic reminders and notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reminders">Automatic Session Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Send automatic reminders to clients before sessions
              </p>
            </div>
            <Switch
              id="reminders"
              checked={settings.auto_reminders}
              onCheckedChange={(checked) => setSettings({ ...settings, auto_reminders: checked })}
            />
          </div>

          {settings.auto_reminders && (
            <div className="space-y-2 pl-8">
              <Label htmlFor="reminder_time">Send reminders</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="reminder_time"
                  type="number"
                  value={settings.reminder_hours}
                  onChange={(e) => setSettings({ ...settings, reminder_hours: e.target.value })}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">hours before session</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {message && (
        <div className={`text-sm ${message.includes("Error") ? "text-destructive" : "text-green-600"}`}>
          {message}
        </div>
      )}

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={updateSettings}
          disabled={saving}
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </div>
  )
}