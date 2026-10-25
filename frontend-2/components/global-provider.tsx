"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { PinCall } from "./custom/pin-dialog"
import { Toaster } from "./ui/toast"
import { ApiResultHandler } from "./contexts/api-result-context"
import { QRCall } from "./custom/qr-dialog"
import { TooltipProvider } from "./ui/tooltip"
import { NFCCall } from "./custom/nfc-dialog"

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
export const useSetPanelType_DO_NOT_USE = () =>
  React.useContext(PanelTypeContext)

export function GlobalProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [panelType, setPanelType] = React.useState<"borne" | "panel">("panel")
  React.useEffect(() => {
    if (typeof window == "undefined") return
    if (panelType === "borne") document.body.classList.add("borne")
    else document.body.classList.remove("borne")
  }, [panelType])
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
        <TooltipProvider timeout={100} delay={50}>
          <QueryClientProvider client={getQueryClient()}>
            <ApiResultHandler>
              {children}
              <PinCall />
              <QRCall />
              <Toaster />
              <NFCCall />
            </ApiResultHandler>
          </QueryClientProvider>
        </TooltipProvider>
      </NextThemesProvider>
    </PanelTypeContext.Provider>
  )
}
