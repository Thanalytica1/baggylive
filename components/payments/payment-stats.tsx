import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PaymentStatsProps {
  payments: any[]
}

export function PaymentStats({ payments }: PaymentStatsProps) {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  // Memoize all expensive statistics calculations
  const { totalRevenue, thisMonthRevenue, lastMonthRevenue, pendingPayments, averagePayment, monthlyGrowth } = useMemo(() => {
    const totalRevenue = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)

    const thisMonthRevenue = payments
      .filter((payment) => {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear
      })
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)

    const lastMonthRevenue = payments
      .filter((payment) => {
        const paymentDate = new Date(payment.payment_date)
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear
        return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear
      })
      .reduce((sum, payment) => sum + (payment.amount || 0), 0)

    const pendingPayments = payments.filter((payment) => payment.status === "pending").length

    const averagePayment = payments.length > 0 ? totalRevenue / payments.length : 0

    const monthlyGrowth = lastMonthRevenue > 0 ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0

    return { totalRevenue, thisMonthRevenue, lastMonthRevenue, pendingPayments, averagePayment, monthlyGrowth }
  }, [payments, currentMonth, currentYear])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      icon: (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
        </svg>
      ),
      bgColor: "bg-green-50",
    },
    {
      title: "This Month",
      value: formatCurrency(thisMonthRevenue),
      change: monthlyGrowth,
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      bgColor: "bg-blue-50",
    },
    {
      title: "Average Payment",
      value: formatCurrency(averagePayment),
      icon: (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Payments",
      value: pendingPayments.toString(),
      icon: (
        <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>{stat.icon}</div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            {stat.change !== undefined && (
              <p className={`text-xs ${stat.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                {stat.change >= 0 ? "+" : ""}
                {stat.change.toFixed(1)}% from last month
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
