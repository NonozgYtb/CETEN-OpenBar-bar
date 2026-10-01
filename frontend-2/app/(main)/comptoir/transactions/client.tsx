"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import { TransactionList } from "@/components/pages/comptoir/transactions/transaction-list"

export const ComptoirTransactions = () => {
  return (
    <InsetLayout pageTitle={"Comptoir • Transactions"}>
      <div className="h-full w-full flex flex-col px-4 gap-4">
        <TransactionList />
      </div>
    </InsetLayout>
  )
}
