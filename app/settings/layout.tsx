import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import Link from "next/link"
import { usePathname } from "next/navigation"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader profile={profile} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Settings Sidebar */}
          <nav className="w-64 space-y-1">
            <h2 className="text-lg font-semibold mb-4">Settings</h2>
            <Link
              href="/settings/profile"
              className="block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Profile Settings
            </Link>
            <Link
              href="/settings/business"
              className="block px-4 py-2 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Business Settings
            </Link>
          </nav>

          {/* Settings Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}