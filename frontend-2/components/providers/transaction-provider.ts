"use client"; 

import { apis, customUseQuery } from "./base-provider"

export const useTransactions = () =>
  customUseQuery({
    queryKey: ["transaction-getAccount"],
    queryFn: () => apis.transactions.getCurrentAccountTransactions()
  })