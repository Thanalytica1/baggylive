import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { StatsCards } from "@/components/dashboard/stats-cards"
import { RevenueChart } from "@/components/dashboard/revenue-chart"
import { RecentSessions } from "@/components/dashboard/recent-sessions"
import { ClientsOverview } from "@/components/dashboard/clients-overview"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  // Fetch dashboard data
  const [{ data: profile }, { data: clients }, { data: sessions }, { data: payments }, { data: leads }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("clients").select("*").eq("trainer_id", user.id),
      supabase
        .from("sessions")
        .select("*, clients(first_name, last_name)")
        .eq("trainer_id", user.id)
        .order("scheduled_at", { ascending: false })
        .limit(5),
      supabase.from("payments").select("*").eq("trainer_id", user.id),
      supabase.from("leads").select("*").eq("trainer_id", user.id),
    ])

  // Calculate stats
  const totalClients = clients?.length || 0
  const totalRevenue = payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0
  const thisMonthSessions =
    sessions?.filter((session) => {
      const sessionDate = new Date(session.scheduled_at)
      const now = new Date()
      return sessionDate.getMonth() === now.getMonth() && sessionDate.getFullYear() === now.getFullYear()
    }).length || 0
  const activeLeads = leads?.filter((lead) => lead.status === "active").length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {profile?.first_name}! Here's your business overview.</p>
        </div>

        <StatsCards
          totalClients={totalClients}
          totalRevenue={totalRevenue}
          thisMonthSessions={thisMonthSessions}
          activeLeads={activeLeads}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <RevenueChart payments={payments || []} />
          <ClientsOverview clients={clients || []} />
        </div>

        <div className="mt-8">
          <RecentSessions sessions={sessions || []} />
        </div>
      </main>
    </div>
  )
}
