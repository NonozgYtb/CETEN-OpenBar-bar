"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import { TransactionList } from "@/components/pages/comptoir/transactions/transaction-list"

export const ComptoirTransactions = () => {
  return (
    <InsetLayout
      pageTitle={"Comptoir • Transactions"}
      className="flex h-full flex-col gap-4 md:gap-6"
    >
      <div className="h-full w-full">
        <TransactionList />
      </div>
    </InsetLayout>
  )
}
