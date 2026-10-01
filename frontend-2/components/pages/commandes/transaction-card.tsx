"use client"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toUrl } from "@/components/providers/base-provider"
import { Transaction } from "@/lib/api"
import { cn, formatCustomFrenchDate, formatPrice } from "@/lib/utils"
import {
  TransactionStateBadge,
  transactionStateBadgeConfig,
  TransactionSupportBadge,
} from "./transaction-badge"
import { Separator } from "@/components/ui/separator"

export const TransactionCard3 = ({
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

export const TransactionCard = ({
  transaction,
  className,
  staff = false,
  ...props
}: {
  transaction: Transaction
  staff?: boolean
} & Omit<React.ComponentProps<typeof Card>, "children">) => {
  return (
    <Card className={cn("w-full gap-2!", className)} {...props}>
      <CardHeader>
        <CardTitle>
          <span>{transaction.account_name}</span>
        </CardTitle>
        <CardAction>
          <div className="flex-warp flex items-center justify-center gap-2">
            <TransactionSupportBadge
              is_remote={transaction.is_remote}
              staff={staff}
            />
            <TransactionStateBadge state={transaction.state} staff={staff} />
          </div>
        </CardAction>
      </CardHeader>
      <Separator />
      <CardContent>
        <div className="flex w-full gap-4">
          <div className="flex flex-1 flex-wrap items-center justify-evenly gap-4">
            {transaction.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-2"
              >
                <img
                  key={`${item.item_id}-${i}`}
                  src={toUrl(item.picture_uri)}
                  alt={item.item_name}
                  className="size-12 rounded-md bg-background object-contain p-2"
                />
                <span>{item.item_name}</span>
                <span className="font-bold text-muted-foreground">
                  &times; {item.item_amount}
                </span>
              </div>
            ))}
          </div>
          <Separator orientation="vertical" className="my-2" />
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-muted-foreground">Total</span>
            <span className="text-lg font-bold">
              {formatPrice(transaction.total_cost)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
