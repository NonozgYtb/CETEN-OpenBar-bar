"use client"

import { PaginationState, useTable } from "@tanstack/react-table"
import { setBy } from "@tanstack/form-core"
import {
  useCategoryList,
  useItems,
} from "@/components/providers/items-provider"
import { useState } from "react"
import { cols } from "./stock-table.columns"
import { CategorySelect } from "@/components/custom/inputs/category-select"
import { Category, Item, ItemState } from "@/lib/api"
import { IconPlus, IconX } from "@tabler/icons-react"
import { Label } from "@/components/ui/label"
import { useDebounce } from "use-debounce"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Tabs, TabsList, TabsSimplifiedTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { _Change, OnSave } from "./stock-table.form"
import { useQueryClient } from "@tanstack/react-query"
import { apis } from "@/components/providers/base-provider"
import { PromotionDialog } from "@/components/custom/comptoir/promotion-dialog"
import { TableRender } from "@/components/layout/table-render"
import { features } from "@/components/layout/table-features"

const pageSize = 8

export function StockTableContent() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 1,
    pageSize,
  })
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)
  const [nameFilter, setNameFilter] = useState<string | null>(null)
  const [stateFilter, setStateFilter] = useState<ItemState | null>(null)
  const [nameDebounce] = useDebounce(nameFilter, 250)
  const qc = useQueryClient()
  const dta = useItems(
    pagination.pageIndex,
    pageSize,
    stateFilter,
    categoryFilter?.id || null,
    nameDebounce?.trim() || null
  )
  const data = dta.data
  const onSave: OnSave = async ({ id, row, ...props }) => {
    const changes: _Change[] =
      "changes" in props
        ? Array.isArray(props.changes)
          ? props.changes
          : [props.changes]
        : []
    console.log("onSave called with:", id, changes)
    // mutate the item in the cache
    const value = changes.reduce(
      (acc, change) => setBy(acc, change.field, change.value),
      "rawChanges" in props ? { ...row, ...props.rawChanges } : row
    )
    apis.items.patchItem(row.category_id, id, value).then((f) => {
      qc.setQueryData(dta.key, (oldData: typeof dta.data) => ({
        ...oldData,
        items: oldData?.items.map((item: Item) =>
          item.id === id ? f.data : item
        ),
      }))
    })
  }
  const categories = useCategoryList()
  const [advanced, setAdvanced] = useState(false)

  const columns = cols(categories.data || [], onSave, advanced)

  const table = useTable({
    features,
    data: data?.items || [],
    rowCount: data?.max_page || 1,
    onPaginationChange: setPagination,
    manualPagination: true,
    columns,
    state: {
      pagination,
    },
    meta: {
      updateRow: (itemId: string, updatedValues: Partial<Item>) => {
        console.log("updateRow called with:", itemId, updatedValues)
      },
    },
    getRowId: (r) => r.id,
  })

  return (
    <>
      {/* Filtres : categories, etat, fournisseur, nom */}
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 md:items-center">
        <div className="flex items-center gap-2">
          <Label htmlFor="name">Par nom :</Label>
          <InputGroup className="w-auto">
            <InputGroupInput
              name="name"
              value={nameFilter ?? ""}
              onChange={(e) => setNameFilter(e.target.value || null)}
              placeholder="Rechercher ..."
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                disabled={!nameFilter}
                onClick={() => setNameFilter(null)}
                variant="ghost"
                size="icon-xs"
              >
                <IconX className="pointer-events-none" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="name">Par état :</Label>
          <Tabs value={stateFilter} onValueChange={setStateFilter}>
            <TabsList>
              <TabsSimplifiedTrigger value={null}>Tout</TabsSimplifiedTrigger>
              <TabsSimplifiedTrigger
                value={ItemState.ItemBuyable}
                className="text-primary-lighter data-active:border-primary-lighter!"
              >
                Achetable
              </TabsSimplifiedTrigger>
              <TabsSimplifiedTrigger
                value={ItemState.ItemNotBuyable}
                className="text-destructive data-active:border-destructive!"
              >
                Non achetable
              </TabsSimplifiedTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="category">Par catégorie :</Label>
          <InputGroup className="w-auto">
            <CategorySelect
              name="category"
              value={categoryFilter}
              setValue={setCategoryFilter}
              placeholder="Aucun filtre"
            />
          </InputGroup>
        </div>
        <Button className="ml-auto">
          <IconPlus className="size-4" data-icon="inline-start" />
          Ajouter un produit
        </Button>
        <Tabs value={advanced} onValueChange={setAdvanced}>
          <TabsList>
            <TabsSimplifiedTrigger value={false}>View</TabsSimplifiedTrigger>
            <TabsSimplifiedTrigger value={true}>Edit</TabsSimplifiedTrigger>
          </TabsList>
        </Tabs>
      </div>
      <TableRender
        table={table}
        pagination={pagination}
        columns={columns}
        setPagination={setPagination}
        max_page={data?.max_page || 1}
      />
      <PromotionDialog />
    </>
  )
}
