"use client"

import {
  PaginationState,
  useTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { features, type DataTableFeatures } from "./data-table-features"
import { createColumnHelper } from "@tanstack/react-table"
import {
  useCategoryList,
  useItems,
} from "@/components/providers/items-provider"
import { GetAllItems200Response, Item, ItemState, RestockType } from "@/lib/api"
import { toUrl } from "@/components/providers/base-provider"
import { Checkbox } from "@/components/ui/checkbox"
import { useEffect, useState } from "react"
import { PaginationComponent } from "@/components/custom/pagination"
import { UseQueryResult } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconPercentage } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Tooltiped } from "@/components/ui/tooltip"
import { PromotionDialog } from "@/components/custom/comptoir/promotion-dialog"

const columnHelper = createColumnHelper<DataTableFeatures, Item>()

interface DataTableProps<TData extends RowData> {
  columns?: ColumnDef<DataTableFeatures, TData>[]
  data: TData[]
}

const useLatentData = (data: UseQueryResult<GetAllItems200Response, Error>) => {
  const [latentData, setLatentData] = useState(data.data || null)
  useEffect(() => {
    if (data.data && !data.isLoading) setLatentData(data.data)
  }, [data.data?.items])
  return latentData
}
const pageSize = 8
export function StockTableContent() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  })
  const dta = useItems(pagination.pageIndex, pageSize, null)
  const data = useLatentData(dta)
  const categories = useCategoryList()
  const cat2 = categories.data
  const columns: ColumnDef<DataTableFeatures, Item>[] = columnHelper.columns([
    columnHelper.accessor("picture_uri", {
      header: "Image",
      cell(props) {
        const pictureUri = props.getValue()
        return pictureUri ? (
          <img
            src={toUrl(pictureUri)}
            alt="Image de l'article"
            className="size-12 rounded-lg bg-sidebar object-contain"
          />
        ) : (
          <div className="size-12 rounded-full bg-sidebar" />
        )
      },
    }),
    columnHelper.accessor("name", {
      header: "Nom",
      cell(props) {
        return (
          <Input className="" value={props.getValue()} onChange={() => {}} />
        )
      },
    }),
    columnHelper.accessor("state", {
      header: "Etat",
      cell: (props) => (
        <Checkbox
          className="bg-destructive/50! data-checked:bg-primary!"
          checked={props.getValue() === ItemState.ItemBuyable}
        />
      ),
    }),
    columnHelper.accessor("category_id", {
      header: "Categorie",
      cell(props) {
        return (
          <Select
            items={cat2?.map((e) => ({ label: e.name, value: e.id })) || []}
            value={props.getValue()}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Categorie" />
            </SelectTrigger>
            <SelectContent>
              {cat2?.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      },
    }),
    columnHelper.accessor("amount_left", {
      header: "Stock/Optimal",
      cell(props) {
        return (
          <div className="flex justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs">Stock</span>
              <Input
                size="small"
                value={props.getValue()}
                type="numeric"
                onChange={() => {}}
                className={cn(
                  "w-24 text-center ring-3",
                  props.getValue() >= 1 ? "ring-primary" : "ring-destructive/50"
                )}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs">Optimal</span>
              <Input
                size="small"
                value={props.row.original.optimal_amount}
                type="numeric"
                onChange={() => {}}
                className="w-24 text-center"
              />
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("display_prices", {
      header: "Prix de base (en €)",
      meta: {
        tableCellClassName: "border-l border-border",
      },
      cell(props) {
        const PrixInput = ({
          value,
          label,
          active = false,
        }: {
          value?: number
          label: string
          active?: boolean
        }) => (
          <Tooltiped
            tooltip={
              props.row.original.promotion
                ? `Promo : ${(((props.getValue()?.externe ?? 0) * (1 - props.row.original.promotion / 100)) / 100).toFixed(2)} €`
                : null
            }
          >
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs">{label}</span>
              <Input
                disabled={!active}
                size="small"
                value={((value ?? 0) / 100).toFixed(2)}
                type="numeric"
                onChange={() => {}}
                className={cn(
                  "w-12 text-center",
                  props.row.original.promotion && "ring-2 ring-warning"
                )}
              />
            </div>
          </Tooltiped>
        )
        // Prix Coutant, Staff, CETEN, Exté
        return (
          <div className="flex items-center justify-center gap-2">
            <PrixInput
              value={props.getValue()?.coutant}
              label="Coutant"
              active
            />
            <PrixInput value={props.getValue()?.staff_bar} label="Staff" />
            <PrixInput value={props.getValue()?.ceten} label="CETEN" />
            <PrixInput value={props.getValue()?.externe} label="Exté" />
            <Tooltiped
              tooltip={
                props.row.original.promotion
                  ? `Promotion: -${props.row.original.promotion}%`
                  : null
              }
            >
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs">Promo</span>
                <div className="size-7">
                  <Button
                    variant={
                      props.row.original.promotion ? "warning" : "secondary"
                    }
                    className="size-7!"
                    size="icon-xs"
                    onClick={() => {
                      PromotionDialog.call({ item: props.row.original })
                    }}
                  >
                    {props.row.original.promotion ?<span className="text-xs">{"-"+props.row.original.promotion}</span>: (
                      <IconPercentage className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Tooltiped>
          </div>
        )
      },
    }),
    columnHelper.accessor("fournisseur", {
      header: "Fournisseur",
      meta: {
        tableCellClassName: "border-l border-border",
      },
      cell(props) {
        const fournisseurs = [
          {
            label: "Auchan",
            value: RestockType.RestockAuchan,
          },
          {
            label: "Auchan Drive",
            value: RestockType.RestockAuchanDrive,
          },
          {
            label: "Viennoiserie",
            value: RestockType.RestockViennoiserie,
          },
          {
            label: "Promocash",
            value: RestockType.RestockPromocash,
          },
          {
            label: "Holy",
            value: RestockType.RestockHoly,
          },
        ]
        return (
          <div className="flex items-center justify-center gap-2">
            <Select items={fournisseurs} value={props.getValue()}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Aucun fourn." />
              </SelectTrigger>
              <SelectContent>
                {fournisseurs.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs">Qte</span>
              <Input
                size="small"
                value={props.row.original.amount_per_bundle}
                type="numeric"
                placeholder="1"
                onChange={() => {}}
                className="w-12 text-center"
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs">Ref.</span>
              <Input
                size="small"
                value={props.row.original.ref_bundle}
                type="numeric"
                onChange={() => {}}
                className="w-24 text-center"
                placeholder="-"
              />
            </div>
          </div>
        )
      },
    }),
  ])
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
  })

  return (
    <div className="overflow-hidden rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className={cn(
                    header.column.columnDef.meta &&
                      "tableCellClassName" in header.column.columnDef.meta &&
                      typeof header.column.columnDef.meta.tableCellClassName ===
                        "string" &&
                      header.column.columnDef.meta.tableCellClassName
                  )}
                >
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      cell.column.columnDef.meta &&
                        "tableCellClassName" in cell.column.columnDef.meta &&
                        typeof cell.column.columnDef.meta.tableCellClassName ===
                          "string" &&
                        cell.column.columnDef.meta.tableCellClassName
                    )}
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                Aucun résultat trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              <PaginationComponent
                value={pagination.pageIndex + 1}
                setValue={(v) =>
                  setPagination({ ...pagination, pageIndex: v - 1 })
                }
                outOf={data?.max_page || 1}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      <PromotionDialog />
    </div>
  )
}
