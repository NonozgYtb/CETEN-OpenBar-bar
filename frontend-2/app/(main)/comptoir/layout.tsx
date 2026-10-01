import { SidebarInset } from "@/components/ui/sidebar"
import { ComptoirSidebar } from "@/components/layout/comptoir-sidebar"

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ComptoirSidebar variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </>
  )
}
