"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import {
  useCategoryList,
  useCategoryProducts,
} from "@/components/providers/category-provider"
import { useParams } from "next/navigation"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { apis, toUrl } from "@/components/providers/base-provider"
import { useCommandeContext } from "@/components/contexts/commande-context"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { usePanelType } from "@/components/global-provider"
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
import {
  MinusCircleIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@phosphor-icons/react/dist/ssr"
import { useAccount } from "@/components/providers/account-provider"
import { NewTransaction } from "@/lib/api"
import { PinCall } from "@/components/layout/dialog"
import { formatPrice } from "@/lib/utils"

export default function CategoryPage() {
  const { id } = useParams()
  const { data, error, isPending } = useCategoryProducts(id as string)
  const category = useCategoryList().data?.find((c) => c.id === id)
  const commande = useCommandeContext()
  const account = useAccount()
  const panelType = usePanelType()
  const itemsPerPage = 10 // TODO : Dynamically per row (height of grid) & column (width of grid)
  const [page, setPage] = useState(1)

  const MainContent = () => {
    if (data?.items && data?.items?.length > 0)
      return (
        <div className="@container/grid flex flex-col overflow-auto">
          <div className="relative grid grid-cols-2 gap-4 rounded-xl @md/grid:grid-cols-4 @4xl/grid:grid-cols-5">
            {(panelType === "borne"
              ? data.items.slice((page - 1) * itemsPerPage, page * itemsPerPage)
              : data.items
            )
              .map((e) => ({
                ...e,
                maxBuyableQuantity: Math.min(
                  e.buy_limit || Infinity,
                  e.amount_left
                ),
              }))
              .map((item) => (
                <Card
                  className={cn(
                    "group [--card-spacing:--spacing(2)]!0 relative pt-0 ring-0! select-none",
                    item.maxBuyableQuantity >= 1
                      ? "cursor-pointer"
                      : "cursor-not-allowed"
                  )}
                  key={"card-" + item.id}
                  onClick={() =>
                    commande.addNewCommande({
                      pictureUri: item.picture_uri,
                      productId: item.id,
                      price:
                        (account.data?.account?.price_role &&
                          item.prices[account.data?.account.price_role]) ||
                        item.display_price ||
                        0,
                      maxBuyableQuantity: item.maxBuyableQuantity,
                      name: item.name,
                    })
                  }
                >
                  <div
                    className={cn(
                      "relative z-20 aspect-square w-full overflow-hidden bg-background",
                      !(item.maxBuyableQuantity >= 1) && "opacity-50 grayscale"
                    )}
                  >
                    {!(item.maxBuyableQuantity >= 1) && (
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(-45deg, transparent calc(50% - 6px) , red calc(50% - 6px), red calc(50% + 6px), transparent calc(50% + 6px))," +
                            "linear-gradient( 45deg, transparent calc(50% - 6px) , red calc(50% - 6px), red calc(50% + 6px), transparent calc(50% + 6px))",
                        }}
                      />
                    )}
                    <div
                      className="absolute inset-0 -z-10 bg-cover bg-center blur-3xl"
                      style={{
                        backgroundImage: `url(${toUrl(item.picture_uri)})`,
                      }}
                    />
                    <div className="flex aspect-square w-full items-center justify-center p-2">
                      <img
                        src={toUrl(item.picture_uri)}
                        alt={item.name}
                        className={cn(
                          "h-auto! max-h-full w-auto! max-w-full rounded-2xl",
                          item.maxBuyableQuantity >= 1 &&
                            "group-hover:scale-105"
                        )}
                      />
                    </div>
                  </div>
                  <CardHeader className="flex-1">
                    <CardTitle className="text-center">{item.name}</CardTitle>
                    {typeof item.display_price === "number" && (
                      <CardDescription className="gap-2 text-center">
                        <span>{formatPrice(item.display_price)}</span>
                        {item.maxBuyableQuantity <= 0 && (
                          <Badge variant="destructive">Rupture</Badge>
                        )}
                        {/* {item.maxBuyableQuantity >= 1 &&
                          commande.reste !== null &&
                          commande.reste < item.display_price / 100 && (
                            <Badge variant="outline">Solde insuffisant</Badge>
                          )} */}
                      </CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
          </div>
          {panelType === "borne" && (
            <div className="sticky right-0 bottom-0 left-0 z-20 col-span-full mt-auto flex w-full items-center justify-center gap-2 bg-background/50 p-4 backdrop-blur-md">
              <Button
                variant="default"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <span className="text-muted-foreground">{`Page ${page} / ${Math.ceil(data.items.length / itemsPerPage)}`}</span>
              <Button
                variant="default"
                disabled={page >= Math.ceil(data.items.length / itemsPerPage)}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          )}
        </div>
      )
    return (
      <div className="@container/grid flex flex-col items-center justify-center overflow-auto">
        <TypoMuted className="text-center select-none">
          Aucun produit disponible dans cette catégorie.
        </TypoMuted>
      </div>
    )
  }
  const AsideBar = () => {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-sidebar p-4 md:shadow-sm">
        <TypoH3 className="text-center">Panier de commande</TypoH3>
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
                      className="size-12 h-full object-contain"
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
                    onClick={() => commande.addNewCommande(c, c.quantity - 1)}
                  >
                    {c.quantity <= 1 ? (
                      <TrashIcon className="size-8 text-destructive" />
                    ) : (
                      <MinusCircleIcon className="size-8" />
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
                    <PlusCircleIcon className="size-8" />
                  </Button>
                </ItemActions>
              </Item>
            ))}
          </div>
        </ScrollArea>
        <Card>
          <CardContent>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex-1">
                <CardTitle>
                  {`Total : ${formatPrice(commande.total)}`}
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
                  let transaction: NewTransaction = {
                    items: commande.commandes.map((item) => ({
                      item_id: item.productId,
                      amount: item.quantity,
                      picked_categories_items: item.picked_categories_items,
                    })),
                    card_pin: card_pin.pin,
                  }
                  return apis.transactions.postTransactions(transaction)
                  // TODO : Catch errors
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
  return (
    <InsetLayout pageTitle={category?.name || "Catégorie"}>
      <div className="h-full w-full">
        <div className="grid h-full w-full gap-4 px-4 @2xl/main:grid-cols-[3fr_minmax(28rem,1fr)]">
          <MainContent />
          <AsideBar />
        </div>
      </div>
    </InsetLayout>
  )
}
