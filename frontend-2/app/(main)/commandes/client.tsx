"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import {
  useCategoryList,
  useCategoryProducts,
} from "@/components/providers/category-provider"
import { useParams } from "next/navigation"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apis, toUrl } from "@/components/providers/base-provider"
import { useCommandeContext } from "@/components/contexts/commande-context"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { usePanelType } from "@/components/global-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TypoH3, TypoMuted } from "@/components/layout/typo"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import {
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr"
import { useAccount } from "@/components/providers/account-provider"
import { NewTransaction, Transaction, TransactionState } from "@/lib/api"
import { PinCall } from "@/components/layout/dialog"
import { useTransactions } from "@/components/providers/transaction-provider"
import { formatCustomFrenchDate, formatPrice } from "@/lib/utils"
import { Separator, SeparatorWithText } from "@/components/ui/separator"

export default function CommandesPage() {
  const account = useAccount()
  const panelType = usePanelType()
  const commandes = useTransactions()

  const transactionStateBadgeConfig: Record<
    TransactionState,
    {
      label: string
      variant: "default" | "destructive" | "secondary" | "outline"
    }
  > = {
    started: {
      label: "Envoyée",
      variant: "default",
    },
    canceled: {
      label: "Annulée",
      variant: "destructive",
    },
    taken_care_of: {
      label: "Prise en charge",
      variant: "secondary",
    },
    finished: {
      label: "Terminée",
      variant: "outline",
    },
  }
  const TransactionStateBadge = ({
    state,
  }: {
    state: Transaction["state"]
  }) => (
    <Badge variant={transactionStateBadgeConfig[state].variant}>
      {transactionStateBadgeConfig[state].label}
    </Badge>
  )

  const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const nbItems = transaction.items.reduce(
      (acc, item) => acc + item.item_amount,
      0
    )
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-bold">
              Commande du {formatCustomFrenchDate(transaction.created_at)}
            </span>
            <TransactionStateBadge state={transaction.state} />
          </CardTitle>
          <CardDescription className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {`${nbItems} article${nbItems > 1 ? "s" : ""} : ${transaction.items.map((item) => `${item.item_amount} × ${item.item_name}${item.state !== transaction.state && transaction.state !== "finished" ? ` (${transactionStateBadgeConfig[item.state].label})` : ""}`).join(" • ")}`}
            </span>
            <span className="text-sm font-bold">
              {formatPrice(-transaction.total_cost, "-")}
            </span>
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const TransactionsList = () => {
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
          <SeparatorWithText className="my-4">Commandes passées</SeparatorWithText>
        )}
        {pastTransactions.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </>
    )
  }

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
            <TransactionsList />
          </div>
        </div>
      </div>
    </InsetLayout>
  )
}
