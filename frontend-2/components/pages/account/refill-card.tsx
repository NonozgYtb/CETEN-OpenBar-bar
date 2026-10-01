"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn, formatCustomFrenchDate, formatPrice } from "@/lib/utils"
import { useRefills } from "@/components/providers/refills-provider"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import { TypoH4 } from "@/components/layout/typo"
import { RefillState, RefillType } from "@/lib/api"

export const refillTypeConfig: Record<RefillType, { label: string }> = {
  [RefillType.RefillCash]: { label: "espèces" },
  [RefillType.RefillCard]: { label: "carte bancaire" },
  [RefillType.RefillTransfer]: { label: "virement" },
  [RefillType.RefillCheck]: { label: "chèque" },
  [RefillType.RefillHelloAsso]: { label: "HelloAsso" },
  [RefillType.RefillOther]: { label: "autre moyen de paiement" },
}

export const RefillCard = () => {
  const refills = useRefills().data?.refills || []
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>{"Recharges :"}</CardTitle>
      </CardHeader>
      <CardContent className={"grid gap-2 md:grid-cols-2"}>
        {refills.length === 0 ? (
          <span className="col-span-full text-center text-sm text-muted-foreground">
            Aucune recharge enregistrée
          </span>
        ) : (
          refills.map((refill) => (
            <Item key={refill.id} variant={"outline"} className="bg-background">
              <ItemContent>
                <ItemTitle>
                  Recharge du {formatCustomFrenchDate(refill.issued_at)}
                </ItemTitle>
                <ItemDescription>
                  Paiement par {refillTypeConfig[refill.type].label} •{" "}
                  {refill.state === RefillState.Canceled
                    ? "Recharge annulée"
                    : "Recharge validée"}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <TypoH4
                  className={cn(
                    refill.state === RefillState.Canceled
                      ? "text-destructive line-through"
                      : "text-primary",
                    "font-bold"
                  )}
                >
                  {formatPrice(refill.amount, "+")}
                </TypoH4>
              </ItemActions>
            </Item>
          ))
        )}
      </CardContent>
    </Card>
  )
}
