"use client"

import { TransactionState } from "@/lib/api/api"
import { apis, useCustomQuery, QueryTag } from "./base-provider"
import { keepPreviousData } from "@tanstack/react-query"

export const useAccountTransactions = ({
  page = 1,
  limit = 10,
  refetchInterval = 5000,
}: {
  page?: number
  limit?: number
  refetchInterval?: number
}) =>
  useCustomQuery({
    queryKey: [QueryTag.TransactionsGetAccount],
    queryFn: () => apis.transactions.getCurrentAccountTransactions(page, limit),
    refetchInterval,
    placeholderData: keepPreviousData,
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
  useCustomQuery({
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
    placeholderData: keepPreviousData,
  })
