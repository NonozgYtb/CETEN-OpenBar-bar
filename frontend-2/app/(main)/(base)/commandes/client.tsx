"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import { TypoMuted } from "@/components/layout/typo"
import { useAccountTransactions } from "@/components/providers/transactions-provider"
import { TransactionsList } from "@/components/pages/commandes/transaction-list"

export default function CommandesPage() {
  const commandes = useAccountTransactions({ page: 1, limit: 10 })

  return (
    <InsetLayout pageTitle={"Mes commandes"}>
      <div className="h-full w-full">
        <div className="flex h-full w-full flex-col gap-4 overflow-y-auto p-4">
          {commandes.data?.transactions.length === 0 && (
            <div className="flex h-full w-full items-center justify-center">
              <TypoMuted>Aucune commande</TypoMuted>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <TransactionsList commandes={commandes} />
          </div>
        </div>
      </div>
    </InsetLayout>
  )
}
