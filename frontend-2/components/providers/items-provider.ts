"use client"

import { Fournisseur, ItemState } from "@/lib/api"
import { apis, useCustomQuery, QueryTag } from "./base-provider"
import { keepPreviousData } from "@tanstack/react-query"

export const useCategoryProducts = (
  categoryId: string,
  page = 1,
  limit = 1000,
  state: ItemState | null = ItemState.ItemBuyable
) =>
  useCustomQuery({
    queryKey: [QueryTag.Items, categoryId],
    queryFn: () =>
      apis.items.getCategoryItems(
        categoryId,
        page,
        limit,
        state === null ? undefined : state
      ),
    enabled: categoryId.length > 0,
    placeholderData: keepPreviousData,
  })

export const useCategoryList = () =>
  useCustomQuery({
    queryKey: [QueryTag.Categories],
    queryFn: () => apis.categories.getCategories(),
    enabled: true,
  })

export const useItems = (
  page = 1,
  limit = 10,
  state: ItemState | null = ItemState.ItemBuyable,
  categoryId?: string | null,
  name?: string | null,
  fournisseur?: Fournisseur | null,
  refBundle?: string | null
) =>
  useCustomQuery({
    queryKey: [
      QueryTag.Items,
      {
        page,
        limit,
        state,
        categoryId,
        name,
        fournisseur,
        refBundle,
      },
    ],
    queryFn: () =>
      apis.items.getAllItems(
        page,
        limit,
        state || void 0,
        categoryId || void 0,
        name || void 0,
        fournisseur || void 0,
        refBundle || void 0
      ),
    placeholderData: keepPreviousData,
  })
