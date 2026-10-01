import { CommandeContextProvider } from "@/components/contexts/commande-context"

export default function CategoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <CommandeContextProvider>{children}</CommandeContextProvider>
}
