import { Geist, Geist_Mono, Inter } from "next/font/google"

import "../globals.css"
import { GlobalProvider } from "@/components/global-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        "dark"
      )}
    >
      <body>
        <GlobalProvider noSidebar>{children}</GlobalProvider>
      </body>
    </html>
  )
}
