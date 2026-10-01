"use client"

import { cn, formatCustomFrenchDate, formatPrice } from "@/lib/utils"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { TypoH4 } from "@/components/layout/typo"
import { RemoteRefill, RemoteRefillState } from "@/lib/api"
import { usePendingRefills } from "@/components/providers/refills-provider"

const remoteRefillStateConfig: Record<
  RemoteRefillState,
  { label: string; className: string; borderClassName: string }
> = {
  [RemoteRefillState.RemoteRefillStarted]: {
    label:
      "En attente de validation par HelloAsso • Au bout de 30min, contactez un membre du bar si votre rechargement n'est pas validé",
    className: "",
    borderClassName: "border-orange-500 border-4 bg-orange-900/50",
  },
  [RemoteRefillState.RemoteRefillProcessed]: {
    label: "Rechargement validé",
    className: "text-primary",
    borderClassName: "border-primary",
  },
  [RemoteRefillState.RemoteRefillAbandoned]: {
    label: "Rechargement abandonné",
    className: "text-destructive line-through",
    borderClassName: "border-destructive",
  },
}
export const PendingRefills = () => {
  const refills = usePendingRefills().data?.remote_refills || []
  return (
    <>
      {refills
        .filter((e) => e.state == RemoteRefillState.RemoteRefillStarted)
        .map((refill) => (
          <Item
            key={refill.id}
            variant={"outline"}
            className={cn(
              "col-span-full bg-background",
              remoteRefillStateConfig[refill.state].borderClassName
            )}
          >
            <ItemContent>
              <ItemTitle>
                Rechargement du {formatCustomFrenchDate(refill.created_at)}
              </ItemTitle>
              <ItemDescription>
                {remoteRefillStateConfig[refill.state].label}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <TypoH4
                className={cn(
                  remoteRefillStateConfig[refill.state].className,
                  "font-bold"
                )}
              >
                {formatPrice(
                  refill.amount,
                  refill.state === RemoteRefillState.RemoteRefillStarted
                    ? undefined
                    : "+"
                )}
              </TypoH4>
            </ItemActions>
          </Item>
        ))}
    </>
  )
}
