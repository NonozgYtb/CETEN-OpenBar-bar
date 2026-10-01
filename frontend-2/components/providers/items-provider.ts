"use client"

import { ItemState } from "@/lib/api"
import { apis, customUseQuery, QueryTag } from "./base-provider"

export const useCategoryProducts = (
  categoryId: string,
  page = 1,
  limit = 1000,
  state: ItemState | null = ItemState.ItemBuyable
) =>
  customUseQuery({
    queryKey: [QueryTag.Items, categoryId],
    queryFn: () =>
      apis.items.getCategoryItems(
        categoryId,
        page,
        limit,
        state === null ? undefined : state
      ),
    enabled: categoryId.length > 0,
  })

export const useCategoryList = () =>
  customUseQuery({
    queryKey: [QueryTag.Categories],
    queryFn: () => apis.categories.getCategories(),
    enabled: true,
  })

export const useItems = (
  page = 1,
  limit = 10,
  state: ItemState | null = ItemState.ItemBuyable
) =>
  customUseQuery({
    queryKey: [QueryTag.Items,limit, page],
    queryFn: () => apis.items.getAllItems(page, limit, state || undefined),
  })
