'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({
  children,
  ...props
}: {
  children: React.ReactNode
  [key: string]: any
}) {
  const [mounted, setMounted] = React.useState(false)

  // DEBUG: Log provider initialization
  React.useEffect(() => {
    console.log('[ThemeProvider Debug] Provider initializing, mounted:', mounted)
  }, [mounted])

  React.useEffect(() => {
    console.log('[ThemeProvider Debug] Setting mounted to true')
    setMounted(true)

    // DEBUG: Check DOM after mount
    setTimeout(() => {
      const htmlElement = document.documentElement
      console.log('[ThemeProvider Debug] HTML element class:', htmlElement.className)
      console.log('[ThemeProvider Debug] HTML element attributes:', {
        class: htmlElement.getAttribute('class'),
        dataTheme: htmlElement.getAttribute('data-theme'),
        style: htmlElement.getAttribute('style')
      })
    }, 100)
  }, [])

  if (!mounted) {
    console.log('[ThemeProvider Debug] Not mounted yet, returning children only')
    return <>{children}</>
  }

  console.log('[ThemeProvider Debug] Mounted, rendering NextThemesProvider with props:', {
    attribute: 'class',
    defaultTheme: 'system',
    enableSystem: true,
    disableTransitionOnChange: false,
    storageKey: 'gymbag-theme',
    ...props
  })

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="gymbag-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
