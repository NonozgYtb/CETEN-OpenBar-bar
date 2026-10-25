"use client"

import { useCategoryProducts } from "@/components/providers/items-provider"
import { useParams } from "next/navigation"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { toUrl } from "@/components/providers/base-provider"
import { useCommandeContext } from "@/components/contexts/commande-context"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { usePanelType } from "@/components/global-provider"
import { Button } from "@/components/ui/button"
import { TypoMuted } from "@/components/layout/typo"
import { formatPrice } from "@/lib/utils"

export const MainContent = () => {
  const { id } = useParams()
  const { data } = useCategoryProducts(id as string)
  const commande = useCommandeContext()
  const panelType = usePanelType()
  const itemsPerPage = 10 // TODO : Dynamically per row (height of grid) & column (width of grid)
  const [page, setPage] = useState(1)

  if (!(data?.items && data?.items?.length > 0))
    return (
      <div className="@container/grid flex flex-col items-center justify-center overflow-auto">
        <TypoMuted className="text-center select-none">
          Aucun produit disponible dans cette catégorie.
        </TypoMuted>
      </div>
    )
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
                  price: item.display_price || 0,
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
                      item.maxBuyableQuantity >= 1 && "group-hover:scale-105"
                    )}
                  />
                </div>
              </div>
              <CardHeader className="flex-1">
                <CardTitle className="text-center">{item.name}</CardTitle>
                {typeof item.display_price === "number" && (
                  <CardDescription className="text-center">
                    <span>{formatPrice(item.display_price)}</span>
                    {item.maxBuyableQuantity <= 0 && (
                      <Badge variant="destructive" className="ml-2">
                        Rupture
                      </Badge>
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
}
