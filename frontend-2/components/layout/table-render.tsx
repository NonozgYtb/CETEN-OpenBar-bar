"use client"

import {
  PaginationState,
  ReactTable,
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
import { type DataTableFeatures } from "./table-features"
import { ReactNode } from "react"
import { PaginationComponent } from "@/components/custom/pagination"
import { cn } from "@/lib/utils"

const ifNo = (value: ReactNode, fallback: ReactNode) =>
  (Array.isArray(value) ? value.length === 0 : !value) ? fallback : value

export const TableRender = <Data extends RowData>({
  table,
  pagination,
  columns,
  setPagination,
  max_page = 1,
}: {
  table: ReactTable<DataTableFeatures, Data>
  pagination: PaginationState | undefined
  columns: ColumnDef<DataTableFeatures, Data>[]
  setPagination?: (pagination: PaginationState) => void
  max_page?: number
}) => (
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
        {ifNo(
          table.getRowModel().rows.map((row) =>
            "getIsSelected" in row && "getVisibleCells" in row ? (
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
            ) : null
          ),
          <TableRow>
            <TableCell colSpan={columns.length} className="h-24 text-center">
              Aucun résultat trouvé.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
      <TableFooter>
        {pagination && (
          <TableRow>
            <TableCell colSpan={columns.length} className="text-center">
              <PaginationComponent
                value={pagination.pageIndex}
                setValue={(v) =>
                  setPagination?.({ ...pagination, pageIndex: v })
                }
                outOf={max_page}
              />
            </TableCell>
          </TableRow>
        )}
      </TableFooter>
    </Table>
  </div>
)
