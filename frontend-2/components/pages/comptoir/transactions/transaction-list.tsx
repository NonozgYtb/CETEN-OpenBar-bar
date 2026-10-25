"use client"

import { TransactionDialog } from "@/components/custom/comptoir/transaction-dialog"
import { PaginationComponent } from "@/components/custom/pagination"
import { useTransactions } from "@/components/providers/transactions-provider"
import { useState } from "react"
import { Tabs, TabsList, TabsSimplifiedTrigger } from "@/components/ui/tabs"
import { TransactionState } from "@/lib/api"
import { cn } from "@/lib/utils"
import { TransactionCard } from "@/components/pages/commandes/transaction-card"

export const TransactionList = () => {
  const [page, setPage] = useState(1)
  const [selectedState, setSelectedState] = useState<TransactionState | "all">(
    TransactionState.TransactionStarted
  )
  const transactions = useTransactions({
    page,
    limit: 10,
    transactionState: selectedState === "all" ? undefined : selectedState,
  })
  return (
    <div className="relative flex h-full flex-col">
      <div className="sticky top-0 right-0 left-0 bg-background px-4 py-4">
        <Tabs value={selectedState} onValueChange={setSelectedState}>
          <TabsList>
            <TabsSimplifiedTrigger value="all">Tout</TabsSimplifiedTrigger>
            <TabsSimplifiedTrigger
              value={TransactionState.TransactionStarted}
              className="text-warning data-active:border-warning!"
            >
              En cours
            </TabsSimplifiedTrigger>
            <TabsSimplifiedTrigger
              value={TransactionState.TransactionFinished}
              className="text-primary-lighter data-active:border-primary-lighter!"
            >
              Terminées
            </TabsSimplifiedTrigger>
            <TabsSimplifiedTrigger
              value={TransactionState.TransactionCanceled}
              className="text-destructive data-active:border-destructive!"
            >
              Annulées
            </TabsSimplifiedTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div
        className={cn(
          "grid flex-1 gap-4 px-4",
          transactions.data?.transactions.length && "content-start"
        )}
      >
        {transactions.data?.transactions.length === 0 && (
          <div className="flex items-center justify-center">
            <p className="text-muted-foreground">Aucune transaction trouvée</p>
          </div>
        )}
        {transactions.data?.transactions.map((transaction) => (
          <div className="h-auto w-full" key={transaction.id}>
            <TransactionCard
              staff
              transaction={transaction}
              className={cn(
                "cursor-pointer transition-all ring-inset hover:bg-card-lighter hover:ring-4",
                transaction.state === TransactionState.TransactionCanceled &&
                  "hover:ring-destructive",
                transaction.state === TransactionState.TransactionFinished &&
                  "hover:ring-primary",
                transaction.state === TransactionState.TransactionStarted &&
                  "hover:ring-warning"
              )}
              onClick={() => {
                TransactionDialog.call({ transaction })
              }}
            />
          </div>
        ))}
      </div>
      <PaginationComponent
        className="sticky right-0 bottom-0 left-0 bg-background px-4 py-4"
        value={page}
        setValue={setPage}
        outOf={transactions?.data?.max_page || 1}
      />
      <TransactionDialog />
    </div>
  )
}
