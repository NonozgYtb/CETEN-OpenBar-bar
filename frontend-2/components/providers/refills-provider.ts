"use client"

import { apis, useCustomQuery, QueryTag } from "./base-provider"

export const useRefills = () =>
  useCustomQuery({
    queryKey: [QueryTag.Refills],
    queryFn: () => apis.refills.getRefills(1),
  })

export const usePendingRefills = () =>
  useCustomQuery({
    queryKey: [QueryTag.RemoteRefills],
    queryFn: () => apis.refills.getPendingRemoteRefills(),
  })
