"use client"

import { ItemState } from "@/lib/api"
import { apis, customUseQuery, QueryTag } from "./base-provider"
import { redirect, useRouter } from "next/navigation"
import { AxiosPromise } from "axios"

export const useRefills = () =>
  customUseQuery({
    queryKey: [QueryTag.Refills],
    queryFn: () => apis.refills.getRefills(1),
  })

export const usePendingRefills = () =>
  customUseQuery({
    queryKey: [QueryTag.RemoteRefills],
    queryFn: () => apis.refills.getPendingRemoteRefills(),
  })
