"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SessionDetailsModal } from "./session-details-modal"

interface SessionsCalendarProps {
  sessions: any[]
}

export function SessionsCalendar({ sessions }: SessionsCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedSession, setSelectedSession] = useState<any>(null)

  const today = new Date()
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  const daysInMonth = lastDayOfMonth.getDate()
  const calendarDays = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null)
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  const getSessionsForDay = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return sessions.filter((session) => {
      const sessionDate = new Date(session.scheduled_at)
      return (
        sessionDate.getDate() === day &&
        sessionDate.getMonth() === currentDate.getMonth() &&
        sessionDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

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

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === "next" ? 1 : -1), 1))
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <>
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {dayNames.map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) {
                return <div key={index} className="h-24 p-1" />
              }

              const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              const isToday =
                dayDate.getDate() === today.getDate() &&
                dayDate.getMonth() === today.getMonth() &&
                dayDate.getFullYear() === today.getFullYear()
              const daySessions = getSessionsForDay(day)

              return (
                <div
                  key={day}
                  className={`h-24 p-1 border border-gray-200 rounded-md ${
                    isToday ? "bg-blue-50 border-blue-200" : "bg-white"
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-900"}`}>{day}</div>
                  <div className="space-y-1">
                    {daySessions.slice(0, 2).map((session) => (
                      <button key={session.id} onClick={() => setSelectedSession(session)} className="w-full text-left">
                        <div className="text-xs p-1 rounded bg-blue-100 text-blue-800 truncate hover:bg-blue-200 transition-colors">
                          {new Date(session.scheduled_at).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                          })}{" "}
                          {session.clients?.first_name}
                        </div>
                      </button>
                    ))}
                    {daySessions.length > 2 && (
                      <div className="text-xs text-gray-500 text-center">+{daySessions.length - 2} more</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {selectedSession && <SessionDetailsModal session={selectedSession} onClose={() => setSelectedSession(null)} />}
    </>
  )
}
