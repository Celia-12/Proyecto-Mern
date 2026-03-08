"use client"

import { Star } from "lucide-react"

export function StarRating({
  rating,
  maxStars = 5,
  interactive = false,
  onRate,
  size = "sm",
}: {
  rating: number
  maxStars?: number
  interactive?: boolean
  onRate?: (rating: number) => void
  size?: "sm" | "md" | "lg"
}) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxStars }, (_, i) => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onRate?.(i + 1)}
          className={interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}
        >
          <Star
            className={`${sizeClasses[size]} ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "fill-muted text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  )
}
