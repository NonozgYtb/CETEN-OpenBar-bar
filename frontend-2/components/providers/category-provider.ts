"use client"; 

import { ItemState } from "@/lib/api"
import { apis, customUseQuery } from "./base-provider"

export const useCategoryProducts = (categoryId: string, page=1,limit=1000, state: ItemState |null = ItemState.ItemBuyable) =>
  customUseQuery({
    queryKey: ["category-products", categoryId],
    queryFn: () => apis.items.getCategoryItems(categoryId, page, limit, state===null ? undefined : state),
    enabled: categoryId.length > 0,
  })

export const useCategoryList = () =>
  customUseQuery({
    queryKey: ["category-list"],
    queryFn: () => apis.categories.getCategories(),
    enabled: true,
  })
