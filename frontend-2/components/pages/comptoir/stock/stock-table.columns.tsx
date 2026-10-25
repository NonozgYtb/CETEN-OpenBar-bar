"use client"

import {
  /* CellContext,  */ DeepKeys,
  type ColumnDef,
} from "@tanstack/react-table"
import { createColumnHelper } from "@tanstack/react-table"
import { Category, Fournisseur, Item, ItemState, RestockType } from "@/lib/api"
import { toUrl } from "@/components/providers/base-provider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input, InputFixed } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { IconCodeAsterisk, IconPercentage } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { cn, wait } from "@/lib/utils"
import { Tooltiped } from "@/components/ui/tooltip"
import { PromotionDialog } from "@/components/custom/comptoir/promotion-dialog"
import { AutoSaveCell, AutoSaveCellStatus, OnSave } from "./stock-table.form"
import z from "zod"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupFixed,
} from "@/components/ui/input-group"
import { transformPrices } from "./stock-table.utils"
import { useMemo } from "react"
import { DataTableFeatures } from "@/components/layout/table-features"

const columnHelper = createColumnHelper<DataTableFeatures, Item>()

const columns = (
  e: (Parameters<typeof columnHelper.columns>[0][number] | false | null)[]
) => columnHelper.columns(e.filter((f) => f !== false && f !== null))

const baseSaveRing = {
  [AutoSaveCellStatus.Error]: "ring-2! ring-destructive!",
  [AutoSaveCellStatus.Saving]: "ring-2! ring-warning!",
  [AutoSaveCellStatus.Saved]: "ring-2! ring-primary!",
} as Record<AutoSaveCellStatus, string>
const baseSaveRing4 = {
  [AutoSaveCellStatus.Error]: "ring-4! ring-destructive!",
  [AutoSaveCellStatus.Saving]: "ring-5! ring-warning!",
  [AutoSaveCellStatus.Saved]: "ring-5! ring-primary!",
} as Record<AutoSaveCellStatus, string>

const defaultOnSave: OnSave = async (e) => wait(1000).then(() => console.log(e))

export const cols = (
  categories: Category[],
  onSave: OnSave = defaultOnSave,
  advanced = false
): ColumnDef<DataTableFeatures, Item>[] =>
  columns([
    columnHelper.accessor("picture_uri", {
      header: "Image",
      cell(props) {
        const pictureUri = props.getValue()
        return pictureUri ? (
          <img
            src={toUrl(pictureUri)}
            alt="Image de l'article"
            className={cn(
              "size-12 rounded-lg bg-sidebar object-contain",
              advanced && "cursor-pointer"
            )}
            onClick={
              (advanced &&
                (() => alert("TODO: Open image's dialog to edit it"))) ||
              void 0
            }
          />
        ) : (
          <div className="size-12 rounded-full bg-sidebar" />
        )
      },
    }),
    columnHelper.accessor("name", {
      header: "Nom",
      meta: {
        tableCellClassName: advanced ? "w-full min-w-36" : "min-w-36",
      },
      cell(cell) {
        return (
          <AutoSaveCell
            showError
            schema={z
              .string()
              .trim()
              .min(1, "Ce champ est requis")
              .max(60, "Le nom est trop long")}
            render={(value, onChange, onBlur, status) => (
              <Input
                disabled={!advanced}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
                className={cn(baseSaveRing[status])}
              />
            )}
            cell={cell}
            onSave={onSave}
          />
        )
      },
    }),
    columnHelper.accessor("state", {
      header: "Etat",
      cell: (cell) => (
        <AutoSaveCell
          showError
          render={(value, onChange, onBlur, status) => (
            <div>
              <Checkbox
                disabled={!advanced}
                className={cn(
                  baseSaveRing4[status],
                  "border-destructive/75! bg-destructive/50 data-checked:border-primary! data-checked:bg-primary-lighter!"
                )}
                checked={value === ItemState.ItemBuyable}
                onCheckedChange={(e) => {
                  onChange(e ? ItemState.ItemBuyable : ItemState.ItemNotBuyable)
                  onBlur()
                }}
              />
            </div>
          )}
          schema={z.enum(ItemState)}
          cell={cell}
          onSave={onSave}
        />
      ),
    }),
    columnHelper.accessor("category_id", {
      header: "Categorie",
      cell(cell) {
        return (
          <AutoSaveCell
            showError
            render={(value, onChange, onBlur, status) => (
              <Select
                disabled={!advanced}
                items={
                  categories?.map((e) => ({ label: e.name, value: e.id })) || []
                }
                value={value}
                onValueChange={(e) => {
                  if (!e) return
                  onChange(e)
                  onBlur()
                }}
              >
                <SelectTrigger
                  className={cn("w-48", baseSaveRing[status])}
                  disableToggle={!advanced}
                >
                  <SelectValue placeholder="Categorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            cell={cell}
            onSave={onSave}
          />
        )
      },
    }),
    columnHelper.accessor("amount_left", {
      header: "Stock/Optimal",
      meta: {
        tableCellClassName: "border-l border-border",
      },
      cell(props) {
        return (
          <div className="flex justify-center gap-2">
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs">Stock</span>
              <AutoSaveCell<number | null>
                showError
                render={(value, onChange, onBlur, status) => (
                  <InputFixed
                    precision={0}
                    size="small"
                    value={value || void 0}
                    setValue={(e) => onChange(e ? Math.round(e) : null)}
                    min={0}
                    onBlur={onBlur}
                    className={cn(
                      "w-24 text-center",
                      typeof value === "number" && value >= 1
                        ? "bg-primary/25"
                        : "bg-destructive/25",
                      baseSaveRing[status]
                    )}
                    onFocus={(e) => e.target.select()}
                  />
                )}
                schema={z
                  .number({ message: "Stock invalide" })
                  .min(0, "Le stock ne peut pas être négatif")}
                cell={props}
                onSave={onSave}
              />
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs">Optimal</span>
              <AutoSaveCell<number | null>
                showError
                render={(value, onChange, onBlur, status) => (
                  <InputFixed
                    precision={0}
                    size="small"
                    value={value || void 0}
                    setValue={(e) => onChange(e ? Math.round(e) : null)}
                    min={0}
                    onBlur={onBlur}
                    className={cn("w-24 text-center", baseSaveRing[status])}
                    onFocus={(e) => e.target.select()}
                  />
                )}
                schema={z.number().min(0, "L'optimal ne peut pas être négatif")}
                cell={props}
                field="optimal_amount"
                cellValue={props.row.original.optimal_amount}
                onSave={onSave}
              />
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor("prices", {
      header: advanced
        ? "Prix de base (en €)"
        : () => (
            <span>
              {"Prix actuels en € "}
              <span className="font-normal text-muted-foreground">
                (promo déduise)
              </span>
            </span>
          ),
      meta: {
        tableCellClassName: "border-l border-border",
      },
      cell(props) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { prices, isPriceOk } = useMemo(() => {
          const prices = transformPrices(
            props.row.original,
            props.row.original.prices.coutant as number,
            categories.find((c) => c.id === props.row.original.category_id) ||
              null
          )
          const isPriceOk =
            prices.coutant === props.row.original.prices.coutant &&
            prices.staff_bar === props.row.original.prices.staff_bar &&
            prices.ceten === props.row.original.prices.ceten &&
            prices.externe === props.row.original.prices.externe
          return { prices, isPriceOk }
        }, [props.row.original])
        const PrixInput = ({
          value,
          label,
          field,
        }: {
          value?: number
          label: string
          field?: DeepKeys<Item>
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
              {field && advanced ? (
                <AutoSaveCell<number | null, unknown>
                  showError
                  render={(value, onChange, onBlur, status) => (
                    <InputFixed
                      disabled={!field}
                      size="small"
                      precision={2}
                      value={
                        typeof value === "number" ? value / 100 : undefined
                      }
                      setValue={(v) =>
                        onChange(v === undefined ? null : Math.round(v * 100))
                      }
                      className={cn(
                        "hide-buttons w-12 text-center",
                        props.row.original.promotion && "bg-warning/40",
                        value === 0 && "bg-destructive/20!",
                        baseSaveRing[status]
                      )}
                      min={0}
                      onBlur={onBlur}
                      onFocus={(e) => e.target.select()}
                    />
                  )}
                  schema={z.number().min(0, "Prix invalide")}
                  cell={props}
                  cellValue={value}
                  field={field}
                  onSave={onSave}
                />
              ) : (
                <Input
                  disabled
                  size="small"
                  value={
                    props.row.original.promotion
                      ? (
                          ((1 - props.row.original.promotion / 100) *
                            (value ?? 0)) /
                          100
                        ).toFixed(2) + " (%)"
                      : ((value ?? 0) / 100).toFixed(2)
                  }
                  type="numeric"
                  onChange={() => {}}
                  className={cn(
                    "w-20 text-center",
                    props.row.original.promotion && "bg-warning/40",
                    value === 0 && "bg-destructive/20!"
                  )}
                />
              )}
            </div>
          </Tooltiped>
        )
        return (
          <div className="flex items-center justify-center gap-2">
            {advanced && (
              <Tooltiped tooltip="Utiliser le tableau de prix (basé sur le prix coutant)">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs">Sync</span>
                  <div className="size-7">
                    <Button
                      variant={isPriceOk ? "default" : "secondary"}
                      className="size-7!"
                      size="icon-xs"
                      onClick={() => {
                        if (
                          confirm(
                            "Voulez-vous synchroniser les prix de cet article avec le tableau de prix ?\nBasé sur le prix coutant"
                          )
                        )
                          onSave({
                            id: props.row.original.id,
                            row: props.row.original,
                            rawValue: props.row.original.prices.coutant,
                            rawChanges: {
                              prices,
                            },
                          })
                      }}
                    >
                      <IconCodeAsterisk className="size-4" />
                    </Button>
                  </div>
                </div>
              </Tooltiped>
            )}
            <PrixInput
              value={props.getValue()?.coutant}
              label="Coutant"
              field="prices.coutant"
            />
            <PrixInput
              value={props.getValue()?.staff_bar}
              label="Staff"
              field="prices.staff_bar"
            />
            <PrixInput
              value={props.getValue()?.ceten}
              label="CETEN"
              field="prices.ceten"
            />
            <PrixInput
              value={props.getValue()?.externe}
              label="Exté"
              field="prices.externe"
            />
            {advanced && (
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
                      {props.row.original.promotion ? (
                        <span className="text-xs">
                          {"-" + props.row.original.promotion}
                        </span>
                      ) : (
                        <IconPercentage className="size-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </Tooltiped>
            )}
          </div>
        )
      },
    }),
    advanced &&
      columnHelper.accessor("fournisseur", {
        header: "Fournisseur",
        meta: {
          tableCellClassName: "border-l border-border",
        },
        cell(props) {
          const fournisseurs = [
            {
              label: "- Aucun -",
              value: undefined,
            },
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
              <AutoSaveCell<Fournisseur | undefined>
                render={(value, onChange, onBlur, status) => (
                  <Select
                    items={fournisseurs}
                    value={value || null}
                    onValueChange={(e) => {
                      onChange(e === null ? undefined : e)
                      onBlur()
                    }}
                  >
                    <SelectTrigger className={cn("w-36", baseSaveRing[status])}>
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
                )}
                cell={props}
                onSave={onSave}
                schema={z.enum(Fournisseur).optional()}
              />
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs">Qte</span>
                <AutoSaveCell<number | null, Fournisseur | undefined>
                  showError
                  render={(value, onChange, onBlur, status) => (
                    <InputFixed
                      size="small"
                      value={value || undefined}
                      setValue={onChange}
                      placeholder="1"
                      onBlur={(e) => {
                        if (e.target.value === "" && typeof value !== "number")
                          onChange(1)
                        onBlur()
                      }}
                      className={cn(
                        "hide-buttons w-12 text-center",
                        baseSaveRing[status]
                      )}
                      min={1}
                      precision={0}
                      onFocus={(e) => e.target.select()}
                    />
                  )}
                  schema={z
                    .number({ message: "Invalide" })
                    .min(
                      1,
                      "La quantité par pack ne peut pas être inférieure à 1"
                    )}
                  cell={props}
                  field="amount_per_bundle"
                  cellValue={props.row.original.amount_per_bundle || null}
                  onSave={onSave}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs">TVA</span>
                <AutoSaveCell<number | null, Fournisseur | undefined>
                  showError
                  render={(value, onChange, onBlur, status) => (
                    <InputGroup size="small">
                      <InputGroupFixed
                        size="small"
                        value={value || undefined}
                        setValue={onChange}
                        placeholder="1"
                        onBlur={(e) => {
                          if (
                            e.target.value === "" &&
                            typeof value !== "number"
                          )
                            onChange(1)
                          onBlur()
                        }}
                        className={cn(
                          "hide-buttons w-12 text-center",
                          baseSaveRing[status]
                        )}
                        min={1}
                        precision={0}
                        onFocus={(e) => e.target.select()}
                      />
                      <InputGroupAddon align="inline-end">%</InputGroupAddon>
                      {/* TODO : TVA 0 5.5 10 20 */}
                    </InputGroup>
                  )}
                  schema={z.number({ message: "Invalide" }).min(0, "TVA ⩾ 0%")}
                  cell={props}
                  field="last_tva"
                  cellValue={props.row.original.last_tva || null}
                  onSave={onSave}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="text-xs">Ref.</span>
                <AutoSaveCell<string | null, Fournisseur | undefined>
                  showError
                  render={(value, onChange, onBlur, status) => (
                    <Input
                      size="small"
                      value={value || ""}
                      onChange={(e) => {
                        const v = e.target.value
                          .toString()
                          .replaceAll(/[^0-9a-zA-Z\-]/g, "")
                        onChange(v)
                      }}
                      placeholder="123456"
                      onBlur={onBlur}
                      className={cn("w-24 text-center", baseSaveRing[status])}
                      onFocus={(e) => e.target.select()}
                    />
                  )}
                  schema={z.string().nullable()}
                  cell={props}
                  field="ref_bundle"
                  cellValue={props.row.original.ref_bundle || null}
                  onSave={onSave}
                />
              </div>
            </div>
          )
        },
      }),
  ])
