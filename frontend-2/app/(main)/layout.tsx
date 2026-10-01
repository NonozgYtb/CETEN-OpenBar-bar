"use client"

import { usePanelType } from "@/components/global-provider"
import { SidebarProvider } from "@/components/ui/sidebar"

export default function GlobalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <SidebarProvider>
      {children}
    </SidebarProvider>
  )
}
