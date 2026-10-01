"use client"

import { useSyncExternalStore } from "react"

export function useMediaQuery(query: string): boolean | null {
  const subscribe = (onChange: () => void) => {
    const matchMedia = window.matchMedia(query)
    matchMedia.addEventListener("change", onChange)
    return () => matchMedia.removeEventListener("change", onChange)
  }

  const getSnapshot = () => {
    const e = window.matchMedia(query).matches
    console.log(e, window)
    return e
  }

  const getServerSnapshot = () => null // Default fallback for Server-Side Rendering (SSR)

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export const TAILWIND_BREAKPOINTS = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const

export type Breakpoint = keyof typeof TAILWIND_BREAKPOINTS

export const useBreakpoint = (breakpoint: Breakpoint): boolean | null =>
  useMediaQuery(TAILWIND_BREAKPOINTS[breakpoint])
