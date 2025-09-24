"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface SessionActionsProps {
  session: any
  onStatusChange?: () => void
}

interface UndoState {
  sessionId: string
  previousStatus: string
  newStatus: string
  previousPackageCount?: number
  timeoutId?: NodeJS.Timeout
}

export function SessionActions({ session, onStatusChange }: SessionActionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [undoState, setUndoState] = useState<UndoState | null>(null)
  const [showUndo, setShowUndo] = useState(false)
  const router = useRouter()
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current)
      }
    }
  }, [])

  const updateSessionStatus = async (newStatus: string, isUndo = false) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const previousStatus = session.status

      // Check if marking as complete with a package that has no sessions remaining
      if (!isUndo && newStatus === "completed" && previousStatus !== "completed" && session.client_package_id) {
        const { data: clientPackage } = await supabase
          .from("client_packages")
          .select("sessions_remaining")
          .eq("id", session.client_package_id)
          .single()

        if (clientPackage && clientPackage.sessions_remaining <= 0) {
          throw new Error("Cannot mark session as completed: Package has no remaining sessions")
        }
      }

      // Update session status
      const { error: updateError } = await supabase
        .from("sessions")
        .update({ status: newStatus })
        .eq("id", session.id)

      if (updateError) throw updateError

      // Handle package count updates
      if (session.client_package_id) {
        const { data: clientPackage } = await supabase
          .from("client_packages")
          .select("sessions_remaining")
          .eq("id", session.client_package_id)
          .single()

        if (clientPackage) {
          let newCount = clientPackage.sessions_remaining

          // Session being marked as completed
          if (newStatus === "completed" && previousStatus !== "completed") {
            newCount = clientPackage.sessions_remaining - 1
          }
          // Session being uncompleted
          else if (previousStatus === "completed" && newStatus !== "completed") {
            newCount = clientPackage.sessions_remaining + 1
          }

          if (newCount !== clientPackage.sessions_remaining) {
            await supabase
              .from("client_packages")
              .update({ sessions_remaining: newCount })
              .eq("id", session.client_package_id)

            // Set up undo state if not already undoing
            if (!isUndo) {
              const undoInfo: UndoState = {
                sessionId: session.id,
                previousStatus,
                newStatus,
                previousPackageCount: clientPackage.sessions_remaining,
              }
              setUndoState(undoInfo)
              setShowUndo(true)

              // Clear undo after 10 seconds
              undoTimeoutRef.current = setTimeout(() => {
                setShowUndo(false)
                setUndoState(null)
              }, 10000)
            }
          }
        }
      } else if (!isUndo) {
        // No package, still set up undo for status change
        const undoInfo: UndoState = {
          sessionId: session.id,
          previousStatus,
          newStatus,
        }
        setUndoState(undoInfo)
        setShowUndo(true)

        undoTimeoutRef.current = setTimeout(() => {
          setShowUndo(false)
          setUndoState(null)
        }, 10000)
      }

      router.refresh()
      if (onStatusChange) onStatusChange()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUndo = async () => {
    if (!undoState) return

    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
    }

    setShowUndo(false)
    await updateSessionStatus(undoState.previousStatus, true)
    setUndoState(null)
  }

  const handleMarkComplete = () => updateSessionStatus("completed")
  const handleMarkMissed = () => updateSessionStatus("cancelled")
  const handleMarkScheduled = () => updateSessionStatus("scheduled")

  // Determine which actions to show based on session status and time
  const now = new Date()
  const sessionDate = new Date(session.scheduled_at)
  const isPastOrCurrent = sessionDate <= now

  return (
    <div className="flex items-center gap-2">
      {session.status === "scheduled" && isPastOrCurrent && (
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkComplete}
            disabled={isLoading}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleMarkMissed}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            Missed
          </Button>
        </>
      )}

      {session.status === "completed" && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkScheduled}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          Revert
        </Button>
      )}

      {session.status === "cancelled" && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleMarkScheduled}
          disabled={isLoading}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          Reschedule
        </Button>
      )}

      {showUndo && undoState && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg flex items-center gap-3 z-50">
          <span>
            Session marked as {undoState.newStatus === "completed" ? "completed" : undoState.newStatus === "cancelled" ? "missed" : "scheduled"}
          </span>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleUndo}
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            Undo
          </Button>
        </div>
      )}
    </div>
  )
}