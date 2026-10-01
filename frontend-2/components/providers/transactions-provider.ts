"use client"

import { TransactionState } from "@/lib/api/api"
import { apis, customUseQuery, QueryTag } from "./base-provider"

export const useAccountTransactions = ({
  page = 1,
  limit = 10,
  refetchInterval = 5000,
}: {
  page?: number
  limit?: number
  refetchInterval?: number
}) =>
  customUseQuery({
    queryKey: [QueryTag.TransactionsGetAccount],
    queryFn: () => apis.transactions.getCurrentAccountTransactions(page, limit),
    refetchInterval,
  })

export const useTransactions = ({
  page = 1,
  limit = 10,
  refetchInterval = 5000,
  transactionState,
}: {
  page?: number
  limit?: number
  transactionState?: TransactionState
  refetchInterval?: number
}) =>
  customUseQuery({
    queryKey: [QueryTag.TransactionsGetAll, transactionState],
    queryFn: () =>
      apis.transactions.getTransactions(
        page,
        limit,
        transactionState,
        false,
        false,
        ""
      ),
    refetchInterval,
  })
