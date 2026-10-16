"use client"

import * as React from "react"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ToastProvider, ToastViewport } from "@/components/ui/toaster"

// Combined provider wrapper for all shadcn components
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* ThemeProvider is in layout.tsx (next-themes) */}
      <TooltipProvider>{children}</TooltipProvider>
      <ToastProvider>
        <ToastViewport />
      </ToastProvider>
    </>
  )
}