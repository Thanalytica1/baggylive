"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SessionDetailsModal } from "./session-details-modal"
import { SessionActions } from "./session-actions"

interface SessionsListProps {
  sessions: any[]
}

export function SessionsList({ sessions }: SessionsListProps) {
  const [selectedSession, setSelectedSession] = useState<any>(null)

  // Get sessions that need attention (past 48 hours to next 7 days)
  const now = new Date()
  const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const upcomingSessions = sessions
    .filter((session) => {
      const sessionDate = new Date(session.scheduled_at)
      // Include past sessions from last 48 hours that are still scheduled (not completed/cancelled)
      // and future sessions for the next week
      return sessionDate >= twoDaysAgo && sessionDate <= nextWeek && session.status === 'scheduled'
    })
    .sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
    }
  }

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Sessions to Review</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingSessions.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-500">No upcoming sessions</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingSessions.map((session) => {
                const { date, time } = formatDateTime(session.scheduled_at)
                return (
                  <div key={session.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="cursor-pointer flex-1"
                        onClick={() => setSelectedSession(session)}
                      >
                        <h4 className="font-medium text-gray-900">
                          {session.clients?.first_name} {session.clients?.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">{session.clients?.email}</p>
                      </div>
                      <Badge className={getStatusColor(session.status)}>{session.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        <span>
                          {date} at {time}
                        </span>
                        <span className="ml-2">{session.duration_minutes} min</span>
                      </div>
                      <SessionActions session={session} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSession && <SessionDetailsModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </>
  )
}
