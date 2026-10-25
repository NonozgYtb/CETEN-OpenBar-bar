"use client"

import { apis, useCustomQuery, QueryTag } from "./base-provider"

export const useAccount = () =>
  useCustomQuery({
    queryKey: [QueryTag.Account],
    queryFn: () =>
      apis.accounts.getAccount().catch((error) => {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        if (error.response?.status === 401) window.location.href = "/auth"

        return Promise.reject(error)
      }),
  })

export const getFullName = (account?: {
  first_name: string
  last_name: string
}) => (account ? `${account.first_name} ${account.last_name}` : "").trim()
