import React, { useState } from "react"
import { StandardSchemaV1Issue, useForm } from "@tanstack/react-form"
import { z } from "zod"
import { CellContext, DeepKeys, DeepValue } from "@tanstack/react-table"
import { Item } from "@/lib/api/api"
import { FieldError } from "@/components/ui/field"
import { DataTableFeatures } from "@/components/layout/table-features"

export enum AutoSaveCellStatus {
  Idle = "idle",
  Saving = "saving",
  Saved = "saved",
  Error = "error",
}

export type _Change = {
  field: DeepKeys<Item>
  value: DeepValue<Item, DeepKeys<Item>>
}

type SingleChange = {
  changes: _Change
}

type MultipleChange = {
  changes: _Change[]
}

type RawChange<T> = {
  rawChanges: Partial<T>
}

export type OnSave = (
  args: {
    id: string
    row: Item
    rawValue: unknown
  } & (SingleChange | MultipleChange | RawChange<Item>)
) => Promise<void> | void

export function AutoSaveCell<T = string | null, U = T>({
  render,
  schema = z.string().min(1, "Ce champ est requis") as unknown as z.ZodType<
    T,
    T
  >,
  onSave,
  showError = false,
  ...props
}: {
  render: (
    value: T,
    onChange: (value: T) => void,
    onBlur: () => void,
    status: AutoSaveCellStatus,
    errorMessage: StandardSchemaV1Issue | null | undefined
  ) => React.ReactNode

  schema?: z.ZodType<T, T>
  onSave: OnSave | void
  showError?: boolean
} & (
  | {
      field: DeepKeys<Item>
      cellValue: T
      cell: CellContext<DataTableFeatures, Item, U>
    }
  | {
      cell: CellContext<DataTableFeatures, Item, U>
    }
)) {
  const [status, setStatus] = useState<AutoSaveCellStatus>(
    AutoSaveCellStatus.Idle
  )

  const initialValue =
    "cellValue" in props ? props.cellValue : (props.cell?.getValue() ?? null)
  const field =
    "field" in props ? props.field : (props.cell.column.id as DeepKeys<Item>)
  const id = ("cell" in props && props.cell?.row.id) || ""

  const form = useForm({
    defaultValues: {
      value: initialValue ?? "",
    } as { value: T },
    validators: {
      onChange: z.object({
        value: schema,
      }),
      onBlur: z.object({
        value: schema,
      }),
    },
    onSubmit: async ({ value }) => {
      if (value.value == initialValue || !id || !field) return
      console.log({ initialValue, value: value.value, id, field })
      try {
        setStatus(AutoSaveCellStatus.Saving)
        await onSave?.({
          id,
          rawValue: value.value,
          changes: {
            field,
            value: value.value,
          },
          row: props.cell?.row.original || {},
        } as Parameters<OnSave>[0])
        setStatus(AutoSaveCellStatus.Saved)
        setTimeout(() => setStatus(AutoSaveCellStatus.Idle), 5000)
      } catch (err) {
        void err
        setStatus(AutoSaveCellStatus.Error)
      }
    },
  })

  return (
    <form.Field name="value">
      {(field) => {
        // Extract error messages from TanStack Form metadata
        const errors = field.state.meta.errors
        const errorMessage = errors.length > 0 ? errors[0] : null

        const handleBlur = async () => {
          field.handleBlur()
          form.handleSubmit()
        }
        const value = field.state.value
        const onChange = (value: T) => {
          field.handleChange(value as Parameters<typeof field.handleChange>[0])
          if (status === AutoSaveCellStatus.Error)
            setStatus(AutoSaveCellStatus.Idle)
        }
        const onBlur = handleBlur
        return (
          <>
            {render(
              value as T,
              onChange,
              onBlur,
              status !== AutoSaveCellStatus.Idle
                ? status
                : errorMessage
                  ? AutoSaveCellStatus.Error
                  : AutoSaveCellStatus.Idle,
              errorMessage
            )}
            {showError && errorMessage && (
              <FieldError errors={[errorMessage]} />
            )}
          </>
        )

        /* if (!render)
          return (
            <Input
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={handleBlur}
              className={cn(
                "h-8 pr-8 text-sm transition-colors",
                hasError &&
                  "border-destructive bg-destructive/5 text-destructive focus-visible:ring-destructive",
                status === "saved" &&
                  "border-emerald-500 bg-emerald-50/50 focus-visible:ring-emerald-500 dark:bg-emerald-950/20",
                status === "error" && "border-destructive bg-destructive/10"
              )}
            />
          )
        return render(
          field.state.value,
          (e) => field.handleChange(e.target.value),
          handleBlur,
          status
        ) */
      }}
    </form.Field>
  )
}
