import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { SessionsCalendar } from "@/components/sessions/sessions-calendar"
import { SessionsList } from "@/components/sessions/sessions-list"
import { AddSessionButton } from "@/components/sessions/add-session-button"

export default async function SessionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: sessions }, { data: clients }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("sessions")
      .select(`
        *,
        clients(id, first_name, last_name, email),
        client_packages(id, sessions_remaining, packages(name))
      `)
      .eq("trainer_id", user.id)
      .order("scheduled_at", { ascending: true }),
    supabase
      .from("clients")
      .select(`
        *,
        client_packages(
          id,
          sessions_remaining,
          status,
          packages(id, name, session_count)
        )
      `)
      .eq("trainer_id", user.id)
      .eq("status", "active"),
  ])

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Sessions</h1>
            <p className="text-muted-foreground">Manage your training sessions and schedule</p>
          </div>
          <AddSessionButton clients={clients || []} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <SessionsCalendar sessions={sessions || []} />
          </div>
          <div>
            <SessionsList sessions={sessions || []} />
          </div>
        </div>
      </main>
    </div>
  )
}
