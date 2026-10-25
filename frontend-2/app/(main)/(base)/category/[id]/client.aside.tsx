"use client"

import { redirect } from "next/navigation"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { apis, toUrl } from "@/components/providers/base-provider"
import { useCommandeContext } from "@/components/contexts/commande-context"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TypoH3, TypoMuted } from "@/components/layout/typo"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item"
import { NewTransaction } from "@/lib/api"
import { PinCall } from "@/components/custom/pin-dialog"
import { formatPrice } from "@/lib/utils"
import {
  BlankAccordion,
  BlankAccordionContent,
  BlankAccordionItem,
  BlankAccordionTrigger,
} from "@/components/ui/blank-accordion"
import {
  IconCaretUp,
  IconCircleMinus,
  IconCirclePlus,
  IconTrash,
} from "@tabler/icons-react"
import { useBreakpoint } from "@/hooks/use-media-query"
import { toastError, ToastId } from "@/components/ui/toast"

export const AsideBar = () => {
  const commande = useCommandeContext()
  const [opened, setOpened] = useState(false)
  const breakpoint = useBreakpoint("md")
  return (
    <div className="flex flex-col gap-2 rounded-xl bg-sidebar p-4 md:shadow-sm">
      <TypoH3 className="hidden text-center md:block">
        Panier de commande
      </TypoH3>
      <BlankAccordion
        value={opened || breakpoint ? ["commandes"] : []}
        onValueChange={() => setOpened((f) => !f)}
      >
        <BlankAccordionItem value="commandes">
          <BlankAccordionTrigger className="items-center justify-center gap-2 pb-2 md:hidden">
            <span className="text-sm">Voir le détail</span>
            <IconCaretUp
              data-slot="accordion-trigger-icon"
              className="pointer-events-none shrink-0 rotate-0 transition-transform group-aria-expanded/accordion-trigger:rotate-180"
            />
          </BlankAccordionTrigger>
          <BlankAccordionContent>
            <ScrollArea className="flex-1">
              <div className="flex h-full w-full flex-col gap-2">
                {commande.commandes.length === 0 && (
                  <TypoMuted className="py-4 text-center select-none">
                    Aucun produit ajouté au panier.
                  </TypoMuted>
                )}
                {commande.commandes.map((c) => (
                  <Item
                    key={c.productId}
                    variant={"muted"}
                    className="flex-nowrap! bg-background"
                  >
                    {c.pictureUri && (
                      <ItemMedia className="flex h-full justify-center">
                        <img
                          src={toUrl(c.pictureUri)}
                          alt={c.name}
                          className="size-12 object-contain"
                        />
                      </ItemMedia>
                    )}
                    <ItemContent className="h-full justify-center">
                      <ItemTitle>{c.name}</ItemTitle>
                      <ItemDescription>{formatPrice(c.price)}</ItemDescription>
                    </ItemContent>
                    <ItemActions className="gap-1!">
                      <span>{formatPrice(c.quantity * c.price)}</span>
                      <Button
                        className="h-auto! p-2 borne:p-2"
                        variant="ghost"
                        onClick={() =>
                          commande.addNewCommande(c, c.quantity - 1)
                        }
                      >
                        {c.quantity <= 1 ? (
                          <IconTrash className="size-8 text-destructive" />
                        ) : (
                          <IconCircleMinus className="size-8" />
                        )}
                      </Button>
                      <span className="w-4 text-center">{c.quantity}</span>
                      <Button
                        className={cn(
                          "h-auto! p-2 borne:p-2",
                          c.quantity >= c.maxBuyableQuantity /* ||
                        (commande.reste !== null &&
                          commande.reste < c.price / 100) */ &&
                            "text-muted-foreground"
                        )}
                        disabled={
                          c.quantity >= c.maxBuyableQuantity /* ||
                      (commande.reste !== null &&
                        commande.reste < c.price / 100) */
                        }
                        onClick={() =>
                          c.quantity >= c.maxBuyableQuantity /* ||
                      (commande.reste !== null &&
                        commande.reste < c.price / 100) */ ||
                          commande.addNewCommande(c, c.quantity + 1)
                        }
                        variant="ghost"
                      >
                        <IconCirclePlus className="size-8" />
                      </Button>
                    </ItemActions>
                  </Item>
                ))}
              </div>
            </ScrollArea>
          </BlankAccordionContent>
        </BlankAccordionItem>
      </BlankAccordion>
      <Card className="mt-auto">
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex-1">
              <CardTitle>
                {`Total : ${formatPrice(commande.total)} `}
                <span className="text-muted-foreground">{`(${commande.commandes.reduce((acc, c) => acc + c.quantity, 0)} articles)`}</span>
              </CardTitle>
              <TypoMuted>
                {`Solde restant : ` +
                  (commande.reste !== null
                    ? formatPrice(commande.reste)
                    : "Non disponible")}
              </TypoMuted>
            </div>
            <Button
              size="lg"
              className="mr-auto"
              variant={
                commande.commandes.length === 0 ? "secondary" : "default"
              }
              disabled={commande.commandes.length === 0}
              onClick={async () => {
                const card_pin = await PinCall.call({})
                if (!card_pin.ok || !card_pin.pin) return
                const transaction: NewTransaction = {
                  items: commande.commandes.map((item) => ({
                    item_id: item.productId,
                    amount: item.quantity,
                    picked_categories_items: item.picked_categories_items,
                  })),
                  card_pin: card_pin.pin,
                }
                return apis.transactions
                  .postTransactions(transaction)
                  .then(() => redirect("/commandes"))
                  .catch((err) => {
                    console.error(err)
                    toastError(
                      ToastId.Transaction_Error,
                      "Erreur lors de la création de la transaction",
                      err.response?.data?.message || "Une erreur est survenue"
                    )
                  })
              }}
            >
              Valider
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
