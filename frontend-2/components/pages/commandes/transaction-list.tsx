"use client"

import { useTransactions } from "@/components/providers/transaction-provider"
import { SeparatorWithText } from "@/components/ui/separator"
import { TransactionCard } from "./transaction-card"

export const TransactionsList = ({
  commandes,
}: {
  commandes: ReturnType<typeof useTransactions>
}) => {
  const currentTransactions =
    commandes.data?.transactions.filter(
      (e) => e.state === "started" || e.state === "taken_care_of"
    ) || []
  const pastTransactions =
    commandes.data?.transactions.filter(
      (e) => e.state === "canceled" || e.state === "finished"
    ) || []
  return (
    <>
      {currentTransactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
      {currentTransactions.length > 0 && pastTransactions.length > 0 && (
        <SeparatorWithText className="my-4">
          Commandes passées
        </SeparatorWithText>
      )}
      {pastTransactions.map((transaction) => (
        <TransactionCard key={transaction.id} transaction={transaction} />
      ))}
    </>
  )
}
