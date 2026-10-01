"use client"

import { apis, customUseQuery, QueryTag } from "./base-provider"
import { useRouter } from "next/navigation"

export const useAccount = () => {
  const router = useRouter()

  const data = customUseQuery({
    queryKey: [QueryTag.Account],
    queryFn: () =>
      apis.accounts.getAccount().catch((error) => {
        if (error.response?.status === 401) {
          router.push("/auth")
        }
        return Promise.reject(error)
      }),
  })

  return data
}

export const getFullName = (account?: {
  first_name: string
  last_name: string
}) => (account ? `${account.first_name} ${account.last_name}` : "").trim()
