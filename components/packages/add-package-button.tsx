"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AddPackageModal } from "./add-package-modal"

export function AddPackageButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Create Package
      </Button>

      {isOpen && <AddPackageModal onClose={() => setIsOpen(false)} />}
    </>
  )
}
