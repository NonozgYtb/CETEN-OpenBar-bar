import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset } from "@/components/ui/sidebar"

export default function BaseLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AppSidebar variant="inset" />
      <SidebarInset>{children}</SidebarInset>
    </>
  )
}
