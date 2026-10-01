"use client"

import { PaginationComponent } from "@/components/custom/pagination"
import { TransactionSupportBadge } from "@/components/pages/commandes/transaction-badge"
import { toUrl } from "@/components/providers/base-provider"
import { useTransactions } from "@/components/providers/transaction-provider"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"
import { useState } from "react"

export const TransactionList = () => {
  const [page, setPage] = useState(1)
  const transactions = useTransactions({ page, limit: 10 })
  return (
    <>
      <div className="flex flex-col gap-4 flex-1">
        {transactions.data?.transactions.map((transaction) => (
          <Card key={transaction.id} className="w-full gap-2!">
            <CardHeader>
              <CardTitle><span>{transaction.account_name}</span></CardTitle>
              <CardAction>
                <TransactionSupportBadge is_remote={transaction.is_remote} />
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
        ))}
      </div>
      <PaginationComponent
        value={page}
        setValue={setPage}
        outOf={transactions?.data?.max_page || 1}
      />
    </>
  )
}