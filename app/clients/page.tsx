import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { ClientsList } from "@/components/clients/clients-list"
import { AddClientButton } from "@/components/clients/add-client-button"

export default async function ClientsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: clients }, { data: packages }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("clients")
      .select(`
      *,
      client_packages(
        *,
        packages(name, price)
      )
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
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-gray-600">Manage your client profiles and training packages</p>
          </div>
          <AddClientButton packages={packages || []} />
        </div>

        <ClientsList clients={clients || []} packages={packages || []} />
      </main>
    </div>
  )
}
