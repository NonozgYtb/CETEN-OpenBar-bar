"use client"

import { SidebarInset } from "@/components/ui/sidebar"
import { ComptoirSidebar } from "@/components/layout/comptoir-sidebar"
import { ComptoirLayout } from "./client"

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ComptoirSidebar variant="inset" />
      <SidebarInset>
        <ComptoirLayout>{children}</ComptoirLayout>
      </SidebarInset>
    </>
  )
}
