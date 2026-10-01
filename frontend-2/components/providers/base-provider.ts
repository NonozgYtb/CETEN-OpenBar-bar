"use client"; 

import {
  AccountsApiFactory,
  AuthApiFactory,
  CarouselApiFactory,
  CashMovementsApiFactory,
  CategoriesApiFactory,
  Configuration,
  CourseApiFactory,
  DeletedApiFactory,
  ItemsApiFactory,
  RefillsApiFactory,
  RestocksApiFactory,
  StarsApiFactory,
  TransactionsApiFactory,
} from "@/lib/api"
import {
  DefaultError,
  QueryKey,
  skipToken,
  useQuery,
  UseQueryOptions,
} from "@tanstack/react-query"
import { AxiosPromise } from "axios"

const config = new Configuration({
  basePath: process.env.NEXT_PUBLIC_API,
  apiKey: (name: string) =>
    name == "X-Local-Token" ? process.env.NEXT_PUBLIC_LOCAL_TOKEN || "" : "",
  baseOptions: {
    withCredentials: true,
  }
})
export const apis = {
  accounts: AccountsApiFactory(config),
  auth: AuthApiFactory(config),
  carousel: CarouselApiFactory(config),
  cashMovements: CashMovementsApiFactory(config),
  categories: CategoriesApiFactory(config),
  course: CourseApiFactory(config),
  deleted: DeletedApiFactory(config),
  items: ItemsApiFactory(config),
  refills: RefillsApiFactory(config),
  restocks: RestocksApiFactory(config),
  stars: StarsApiFactory(config),
  transactions: TransactionsApiFactory(config),
}

const queryFnWrapper = <T>(promise: AxiosPromise<T>) =>
  promise
    .then((response) => response.data)
    .catch((error) => {
      throw new Error(error.response?.data?.message || "An error occurred")
    })

export const customUseQuery = <
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>({
  queryFn,
  retryDelay,
  ...options
}: Omit<UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>, "queryFn"> & {
  queryFn?: () => AxiosPromise<TQueryFnData>
}) =>
  useQuery({
    ...options,
    queryFn: queryFn ? () => queryFnWrapper(queryFn!()) : undefined,
    retryDelay:
      retryDelay ||
      ((attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)),
  })

export const toUrl = (path: string) => {
  const basePath = process.env.NEXT_PUBLIC_API || ""
  return `${basePath}${path.startsWith("/") ? path : `/${path}`}`
}
