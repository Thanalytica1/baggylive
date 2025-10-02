'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  React.useEffect(() => {
    console.log('🎨 ThemeProvider initialized with config:', {
      attribute: 'class',
      defaultTheme: 'system',
      enableSystem: true,
      storageKey: 'gymbag-theme',
      disableTransitionOnChange: false,
      value: { light: '', dark: 'dark' }
    })

    // Check if dark class exists on html
    const htmlElement = document.documentElement
    console.log('🎨 HTML element classes:', htmlElement.className)
    console.log('🎨 Has dark class:', htmlElement.classList.contains('dark'))

    // Check localStorage
    const storedTheme = localStorage.getItem('gymbag-theme')
    console.log('🎨 Stored theme in localStorage:', storedTheme)

    // Watch for class changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          console.log('🎨 HTML class changed to:', htmlElement.className)
          console.log('🎨 Dark mode active:', htmlElement.classList.contains('dark'))
        }
      })
    })

    observer.observe(htmlElement, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
      storageKey="gymbag-theme"
      value={{
        light: '',
        dark: 'dark'
      }}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
