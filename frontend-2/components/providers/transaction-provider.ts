"use client"

import { TransactionState } from "@/lib/api/api"
import { apis, customUseQuery, QueryTag } from "./base-provider"

export const useTransactions = ({
  page = 1,
  limit = 10,
  state = TransactionState.TransactionStarted,
  refetchInterval=5000
}: {
  page?: number
  limit?: number
  state?: TransactionState
  refetchInterval?: number
}) =>
  customUseQuery({
    queryKey: [QueryTag.TransactionsGetAccount],
    queryFn: () =>
      apis.transactions.getCurrentAccountTransactions(page, limit, state),
    refetchInterval
  })
