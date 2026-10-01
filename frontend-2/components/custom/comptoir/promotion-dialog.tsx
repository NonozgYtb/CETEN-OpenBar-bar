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
import { useForm, useSelector } from "@tanstack/react-form"
import {
  IconChecks,
  IconMinus,
  IconPercentage,
  IconTrash,
} from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import { toast, ToastType } from "@/components/ui/toast"
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
  InputGroupInput,
  InputGroupAddon,
  InputGroupFixed,
} from "@/components/ui/input-group"
import { PriceBadge } from "@/components/layout/app-header"
import { formatPrice } from "@/lib/utils"
import { useMemo } from "react"

const PromotionDialog = createCallable<{ item: Item }, {}>(({ call, item }) => {
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
          .min(0, "La réduction doit être supérieure ou égale à 0")
          .max(100, "La réduction doit être inférieure ou égale à 100"),
        promotion_ends_at: z.number().nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      alert(`Form submitted with values:\n${JSON.stringify(value)}`)
    },
  })

  const end = () => call.end({})
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
        toast.add({
          title: `Promotion ${status}`,
          description: `La promotion a été ${status} avec succès.`,
          id: `item-${item.id}-promotion-${isApply ? "applied" : "removed"}`,
          type: ToastType.SUCCESS,
        })
      })
      .catch(() => {
        toast.add({
          title: `Erreur lors de ${actText} de la promotion`,
          description: `Une erreur est survenue lors de ${actText} de la promotion.`,
          id: `item-${item.id}-promotion-${actionKey}-error`,
          type: ToastType.ERROR,
        })
      })
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: [QueryTag.Items] })
        call.end({})
      })
  }

  const wPromo = useSelector(form.store, (state) => state.values.percentage)
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
    [item, wPromo]
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
            <form.Field
              name="percentage"
              children={(field) => (
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
                      setValue={(value) => field.handleChange(parseInt(value))}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
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
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            />
            {/* <form.Field
              name="promotion_ends_at"
              children={(field) => (
                <Field
                  data-invalid={
                    field.state.meta.isTouched && !field.state.meta.isValid
                  }
                >
                  <FieldLabel htmlFor={field.name}>Date de fin</FieldLabel>
                  <InputGroup>
                    <InputGroupAddon>
                      <IconMinus />
                    </InputGroupAddon>
                    <InputGroupInput
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      type="number"
                      step="1"
                      onChange={(e) => field.handleChange(parseInt(e.target.value))}
                      aria-invalid={
                        field.state.meta.isTouched && !field.state.meta.isValid
                      }
                      autoComplete="off"
                    />
                    <InputGroupAddon align="inline-end">
                      <IconPercentage />
                    </InputGroupAddon>
                  </InputGroup>
                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            /> */}
            <span>{"<ici la date & heure de fin>"}</span>
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
}, 1000)

PromotionDialog.displayName = "PromotionDialog"
export { PromotionDialog }
