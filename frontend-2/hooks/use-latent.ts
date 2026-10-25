import { UseQueryResult } from "@tanstack/react-query"
import { useState, useEffect } from "react"

export const useLatentItemsData = <T extends { items: any[] }>(
  data: UseQueryResult<T, Error>
) => {
  const [latentData, setLatentData] = useState(data.data || null)
  useEffect(() => {
    if (data.data && !data.isLoading) setLatentData(data.data)
  }, [data.data?.items])
  return latentData
}
