import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "3xl"
  className?: string
  showText?: boolean
}

const sizeMap = {
  sm: { width: 32, height: 32 },
  md: { width: 48, height: 48 },
  lg: { width: 64, height: 64 },
  xl: { width: 80, height: 80 },
  "3xl": { width: 192, height: 192 },
}

export function Logo({ size = "md", className, showText = false }: LogoProps) {
  const { width, height } = sizeMap[size]

  return (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="GymBag Logo"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
      {showText && (
        <span className={cn(
          "font-bold text-gray-900 ml-3",
          size === "sm" && "text-lg",
          size === "md" && "text-xl",
          size === "lg" && "text-2xl",
          size === "xl" && "text-3xl",
          size === "3xl" && "text-5xl"
        )}>
          GymBag
        </span>
      )}
    </div>
  )
}