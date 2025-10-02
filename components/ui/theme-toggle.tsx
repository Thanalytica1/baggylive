"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Moon, Sun, Monitor, Loader2 } from "lucide-react"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    console.log('🎨 ThemeToggle mounted:', { theme, resolvedTheme, mounted: true })
  }, [])

  React.useEffect(() => {
    if (mounted) {
      console.log('🎨 Theme state changed:', { theme, resolvedTheme })
    }
  }, [theme, resolvedTheme, mounted])

  const getIcon = () => {
    if (!mounted) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }

    switch (resolvedTheme) {
      case "light":
        return <Sun className="h-4 w-4" />
      case "dark":
        return <Moon className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const handleThemeChange = (newTheme: string) => {
    console.log('🎨 Theme change requested:', { from: theme, to: newTheme })
    setTheme(newTheme)
    console.log('🎨 setTheme called with:', newTheme)
  }

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        disabled
        aria-label="Loading theme toggle"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="sr-only">Loading theme toggle</span>
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 transition-colors"
          aria-label={`Current theme: ${theme}. Click to change theme`}
        >
          {getIcon()}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {console.log('🎨 Dropdown content rendered')}
        <DropdownMenuItem
          onSelect={(e) => {
            console.log('🎨 onSelect fired for light', e)
            handleThemeChange("light")
          }}
          onClick={(e) => {
            console.log('🎨 onClick fired for light', e)
            e.preventDefault()
            e.stopPropagation()
            handleThemeChange("light")
          }}
          onPointerDown={(e) => {
            console.log('🎨 onPointerDown fired for light', e)
          }}
          onMouseDown={(e) => {
            console.log('🎨 onMouseDown fired for light', e)
          }}
          className={theme === "light" ? "bg-accent text-accent-foreground" : ""}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            console.log('🎨 onSelect fired for dark', e)
            handleThemeChange("dark")
          }}
          onClick={(e) => {
            console.log('🎨 onClick fired for dark', e)
            e.preventDefault()
            e.stopPropagation()
            handleThemeChange("dark")
          }}
          onPointerDown={(e) => {
            console.log('🎨 onPointerDown fired for dark', e)
          }}
          onMouseDown={(e) => {
            console.log('🎨 onMouseDown fired for dark', e)
          }}
          className={theme === "dark" ? "bg-accent text-accent-foreground" : ""}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            console.log('🎨 onSelect fired for system', e)
            handleThemeChange("system")
          }}
          onClick={(e) => {
            console.log('🎨 onClick fired for system', e)
            e.preventDefault()
            e.stopPropagation()
            handleThemeChange("system")
          }}
          onPointerDown={(e) => {
            console.log('🎨 onPointerDown fired for system', e)
          }}
          onMouseDown={(e) => {
            console.log('🎨 onMouseDown fired for system', e)
          }}
          className={theme === "system" ? "bg-accent text-accent-foreground" : ""}
        >
          <Monitor className="mr-2 h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}