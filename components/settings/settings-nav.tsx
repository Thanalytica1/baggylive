"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export function SettingsNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/settings/profile", label: "Profile Settings" },
    { href: "/settings/business", label: "Business Settings" },
  ]

  return (
    <nav className="w-64 space-y-1">
      <h2 className="text-lg font-semibold mb-4">Settings</h2>
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`block px-4 py-2 text-sm rounded-md transition-colors ${
            pathname === item.href
              ? "bg-accent text-accent-foreground font-medium"
              : "hover:bg-accent hover:text-accent-foreground"
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  )
}
