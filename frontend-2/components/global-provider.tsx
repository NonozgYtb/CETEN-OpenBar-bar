"use client"

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PinCall } from "./layout/dialog"

let browserQueryClient: QueryClient | undefined
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__: QueryClient
  }
}

function getQueryClient() {
  // Keep server requests isolated and preserve the browser cache across renders.
  if (typeof window === "undefined") return new QueryClient()
  browserQueryClient ??= new QueryClient()
  if (process.env.NODE_ENV === "development")
    window.__TANSTACK_QUERY_CLIENT__ = browserQueryClient
  return browserQueryClient
}

const PanelTypeContext = React.createContext<{
  value: "borne" | "panel"
  setValue: (value?: "borne" | "panel") => void
}>({ value: "panel", setValue: () => {} })

export const usePanelType = () => React.useContext(PanelTypeContext).value
export const _useSetPanelType = () => React.useContext(PanelTypeContext)

export function GlobalProvider({
  children,
  noSidebar = false,
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & {
  noSidebar?: boolean
}) {
  const [panelType, setPanelType] = React.useState<"borne" | "panel">("panel")
  return (
    <PanelTypeContext.Provider
      value={{
        value: panelType,
        setValue: (value) =>
          setPanelType((v) => value ?? (v === "borne" ? "panel" : "borne")),
      }}
    >
      <NextThemesProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
        {...props}
      >
        <QueryClientProvider client={getQueryClient()}>
          {noSidebar ? (
            <>{children}</>
          ) : (
            <SidebarProvider className={panelType === "borne" ? "borne" : ""}>
              <AppSidebar variant="inset" />
              <SidebarInset>
                {children}
                <PinCall/>
              </SidebarInset>
            </SidebarProvider>
          )}
        </QueryClientProvider>
      </NextThemesProvider>
    </PanelTypeContext.Provider>
  )
}
