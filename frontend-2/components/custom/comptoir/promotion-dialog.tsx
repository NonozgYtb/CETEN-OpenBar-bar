"use client"

import { createCallable } from "react-call"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AccountPriceRole, Item } from "@/lib/api"
import { apis, QueryTag } from "@/components/providers/base-provider"
import { useForm } from "@tanstack/react-form"
import {
  IconChecks,
  IconMinus,
  IconPercentage,
  IconTrash,
} from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { toastError, ToastId, toastSuccess } from "@/components/ui/toast"
import { useQueryClient } from "@tanstack/react-query"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import z from "zod"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupFixed,
} from "@/components/ui/input-group"
import { PriceBadge } from "@/components/layout/app-header"
import { formatPrice } from "@/lib/utils"
import { useMemo } from "react"
import { DatePickerDemo } from "@/components/custom/inputs/datepicker"
import { TZDate } from "react-day-picker"

const PromotionDialog = createCallable<{ item: Item }, void>(
  ({ call, item }) => {
    const queryClient = useQueryClient()

    const form = useForm({
      defaultValues: {
        percentage: item.promotion || 0,
        promotion_ends_at: item.promotion_ends_at || null,
      },
      validators: {
        onSubmit: z.object({
          percentage: z
            .number()
            .gt(0, "La réduction doit être supérieure à 0")
            .max(100, "La réduction doit être inférieure ou égale à 100"),
          promotion_ends_at: z.number("La date doit être fixée"),
        }),
      },
      onSubmit: async ({ value }) => {
        alert(`Form submitted with values:\n${JSON.stringify(value)}`)
      },
    })

    const end = () => call.end()
    const endWithAction = async (action: "apply" | "remove") => {
      const isApply = action === "apply"
      const status = isApply ? "appliquée" : "supprimée"
      const actText = isApply ? "l'application" : "la suppression"
      const actionKey = isApply ? "apply" : "remove"
      return apis.items
        .patchItem(
          item.category_id,
          item.id,
          isApply
            ? {
                promotion: form.state.values.percentage || 0,
                promotion_ends_at: form.state.values.promotion_ends_at || 0,
              }
            : { promotion: 0, promotion_ends_at: 0 }
        )
        .then(() => {
          toastSuccess(
            ToastId.Custom,
            `Promotion ${status}`,
            `La promotion a été ${status} avec succès.`,
            `item-${item.id}-promotion-${isApply ? "applied" : "removed"}`
          )
        })
        .catch(() => {
          toastError(
            ToastId.Custom,
            `Erreur lors de ${actText} de la promotion`,
            `Une erreur est survenue lors de ${actText} de la promotion.`,
            `item-${item.id}-promotion-${actionKey}-error`
          )
        })
        .finally(() => {
          queryClient.invalidateQueries({ queryKey: [QueryTag.Items] })
          call.end()
        })
    }

    const tarifs = useMemo(
      () => (
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center justify-items-center gap-2 text-sm text-muted-foreground">
          <b>Tarif</b>
          {[
            AccountPriceRole.AccountPriceCoutant,
            AccountPriceRole.AccountPriceStaffBar,
            AccountPriceRole.AccountPriceCeten,
            AccountPriceRole.AccountPriceExterne,
          ].map((r) => (
            <PriceBadge key={r} price_role={r} />
          ))}
          <b>Avant promo</b>
          {[
            AccountPriceRole.AccountPriceCoutant,
            AccountPriceRole.AccountPriceStaffBar,
            AccountPriceRole.AccountPriceCeten,
            AccountPriceRole.AccountPriceExterne,
          ].map((r) => (
            <span key={r}>
              {typeof item.prices[r] === "number"
                ? formatPrice(item.prices[r])
                : "—"}
            </span>
          ))}
          <b>Après promo</b>
          {[
            AccountPriceRole.AccountPriceCoutant,
            AccountPriceRole.AccountPriceStaffBar,
            AccountPriceRole.AccountPriceCeten,
            AccountPriceRole.AccountPriceExterne,
          ].map((r) => (
            <span key={r} className="text-foreground">
              {typeof item.prices[r] === "number"
                ? formatPrice(
                    item.prices[r] *
                      (1 - (form.state.values.percentage || 0) / 100)
                  )
                : "—"}
            </span>
          ))}
        </div>
      ),
      [form.state.values.percentage, item.prices]
    )

    return (
      <Dialog open={!call.ended} defaultOpen onOpenChange={end}>
        <DialogContent
          overlayProps={{
            onClick: end,
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              Promotion
            </DialogTitle>
          </DialogHeader>
          <div className="-mx-6">
            <Separator />
          </div>
          <div className="flex flex-1 items-center justify-evenly gap-4 text-lg">
            <FieldGroup>
              <form.Field name="percentage">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Réduction</FieldLabel>
                    <InputGroup>
                      <InputGroupAddon>
                        <IconMinus />
                      </InputGroupAddon>
                      <InputGroupFixed
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        precision={0}
                        setValue={(value) => field.handleChange(value)}
                        aria-invalid={
                          field.state.meta.isTouched &&
                          !field.state.meta.isValid
                        }
                        min={0}
                        max={100}
                        autoComplete="off"
                        onFocus={(e) => e.target.select()}
                      />
                      <InputGroupAddon align="inline-end">
                        <IconPercentage />
                      </InputGroupAddon>
                    </InputGroup>
                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                  </Field>
                )}
              </form.Field>
              <form.Field name="promotion_ends_at">
                {(field) => (
                  <Field
                    data-invalid={
                      field.state.meta.isTouched && !field.state.meta.isValid
                    }
                  >
                    <FieldLabel htmlFor={field.name}>Date de fin</FieldLabel>
                    <DatePickerDemo
                      date={
                        field.state.value
                          ? new TZDate(
                              (field.state.value || 0) * 1000,
                              "Europe/Paris"
                            )
                          : null
                      }
                      setDate={(date) =>
                        field.handleChange(
                          date ? Math.floor(date.getTime() / 1000) : null
                        )
                      }
                    />
                    {field.state.meta.isTouched &&
                      !field.state.meta.isValid &&
                      field.state.value !== null && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    {field.state.value === null && (
                      <FieldError
                        errors={[{ message: "La date doit être fixée" }]}
                      />
                    )}
                  </Field>
                )}
              </form.Field>
            </FieldGroup>
          </div>
          <div className="-mx-6">
            <Separator />
          </div>
          {tarifs}
          <div className="-mx-6">
            <Separator />
          </div>
          <DialogFooter className="flex w-full flex-wrap items-center justify-center gap-4">
            <DialogClose
              onClick={() => {
                endWithAction("remove")
              }}
              variant={"destructive"}
              buttonRender
              className="flex-1"
            >
              <IconTrash />
              {" Suppr. la promo"}
            </DialogClose>
            <DialogClose
              onClick={() => {
                endWithAction("apply")
              }}
              variant={"default"}
              buttonRender
              disabled={
                !form.state.isValid ||
                !form.state.isDirty ||
                form.state.values.promotion_ends_at === null
              }
              className="flex-1"
            >
              <IconChecks />
              {" Save/Appliquer la promo"}
            </DialogClose>
            <DialogClose
              onClick={end}
              variant={"outline"}
              buttonRender
              className="flex-1"
            >
              Retour
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
  1000
)

PromotionDialog.displayName = "PromotionDialog"
export { PromotionDialog }
