import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PaymentsList } from "@/components/payments/payments-list"
import { PaymentStats } from "@/components/payments/payment-stats"
import { AddPaymentButton } from "@/components/payments/add-payment-button"

export default async function PaymentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: payments }, { data: clients }, { data: packages }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("payments")
      .select(`
        *,
        clients(id, first_name, last_name, email),
        client_packages(id, packages(name)),
        sessions(id, scheduled_at, duration_minutes)
      `)
      .eq("trainer_id", user.id)
      .order("payment_date", { ascending: false }),
    supabase
      .from("clients")
      .select("id, first_name, last_name, email")
      .eq("trainer_id", user.id)
      .eq("status", "active"),
    supabase.from("packages").select("*").eq("trainer_id", user.id).eq("is_active", true),
  ])

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader profile={profile} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
            <p className="text-gray-600">Track payments, invoices, and financial performance</p>
          </div>
          <AddPaymentButton clients={clients || []} packages={packages || []} />
        </div>

        <PaymentStats payments={payments || []} />

        <div className="mt-8">
          <PaymentsList payments={payments || []} />
        </div>
      </main>
    </div>
  )
}
