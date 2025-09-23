import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { LeadsList } from "@/components/leads/leads-list"
import { LeadStats } from "@/components/leads/lead-stats"
import { AddLeadButton } from "@/components/leads/add-lead-button"

export default async function LeadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: leads }, { data: packages }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("leads")
      .select(`
        *,
        clients(id, first_name, last_name, email)
      `)
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("packages").select("*").eq("trainer_id", user.id).eq("is_active", true),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
            <p className="text-gray-600">Track and convert potential clients into paying customers</p>
          </div>
          <AddLeadButton />
        </div>

        <LeadStats leads={leads || []} />

        <div className="mt-8">
          <LeadsList leads={leads || []} packages={packages || []} />
        </div>
      </main>
    </div>
  )
}
