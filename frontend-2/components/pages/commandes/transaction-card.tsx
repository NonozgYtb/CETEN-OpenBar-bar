"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toUrl } from "@/components/providers/base-provider"
import { Transaction } from "@/lib/api"
import { formatCustomFrenchDate, formatPrice } from "@/lib/utils"
import {
  TransactionStateBadge,
  transactionStateBadgeConfig,
} from "./transaction-badge"

export const TransactionCard = ({
  transaction,
}: {
  transaction: Transaction
}) => {
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
            {`${nbItems} article${nbItems > 1 ? "s" : ""} : ${transaction.items
              .map(
                (item) =>
                  `${item.item_amount} × ${item.item_name}${
                    item.state !== transaction.state &&
                    transaction.state !== "finished"
                      ? ` (${transactionStateBadgeConfig[item.state].label})`
                      : ""
                  }`
              )
              .join(" • ")}`}
          </span>
          <span className="text-sm font-bold">
            {formatPrice(-transaction.total_cost, "-")}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-row! flex-wrap gap-2">
        {transaction.items.map((item) =>
          Array(Math.floor(item.item_amount))
            .fill(0)
            .map((e, i) => (
              <img
                key={`${item.item_id}-${i}`}
                src={toUrl(item.picture_uri)}
                alt={item.item_name}
                className="size-16 rounded-md bg-background object-contain"
              />
            ))
        )}
      </CardContent>
    </Card>
  )
}
