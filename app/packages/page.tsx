import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PackagesList } from "@/components/packages/packages-list"
import { AddPackageButton } from "@/components/packages/add-package-button"

export default async function PackagesPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: packages }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("packages")
      .select(`
        *,
        client_packages(
          id,
          client_id,
          sessions_remaining,
          sessions_total,
          status,
          clients(first_name, last_name)
        )
      `)
      .eq("trainer_id", user.id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Training Packages</h1>
            <p className="text-gray-600">Create and manage your custom training packages</p>
          </div>
          <AddPackageButton />
        </div>

        <PackagesList packages={packages || []} />
      </main>
    </div>
  )
}
