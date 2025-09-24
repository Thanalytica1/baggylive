"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface RevenueChartProps {
  payments: any[]
}

export function RevenueChart({ payments }: RevenueChartProps) {
  // Memoize the expensive monthly revenue calculation
  const chartData = useMemo(() => {
    // Group payments by month
    const monthlyRevenue = payments.reduce(
      (acc, payment) => {
        const date = new Date(payment.payment_date)
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        const monthName = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        if (!acc[monthKey]) {
          acc[monthKey] = { month: monthName, revenue: 0 }
        }
        acc[monthKey].revenue += payment.amount || 0
        return acc
      },
      {} as Record<string, { month: string; revenue: number }>,
    )

    return Object.values(monthlyRevenue).slice(-6) // Last 6 months
  }, [payments])

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <Tooltip
                formatter={(value) => [`$${value}`, "Revenue"]}
                labelStyle={{ color: "#374151" }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
