"use client"

import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getFullName,
  useAccount,
} from "@/components/providers/accounts-provider"
import { GenericAvatar } from "@/components/ui/avatar"
import { formatPrice } from "@/lib/utils"
import { PriceBadge } from "@/components/layout/app-header"
import { IconStarFilled } from "@tabler/icons-react"
import { RefillDialog } from "./refill-dialog"
import { Kbd } from "@/components/ui/kbd"

export default function AccountCard() {
  const account = useAccount().data?.account
  return (
    <>
      <Card>
        <CardHeader className="grid-cols-[auto_1fr]! md:gap-x-4!">
          <CardAction className="col-start-1! self-center! justify-self-center!">
            <GenericAvatar
              account={account}
              className="size-10 rounded-lg md:size-12"
            />
          </CardAction>
          <CardTitle>{getFullName(account)}</CardTitle>
          <CardDescription>
            {`${account?.email_address || "Pas de compte TN.net lié"} (`}
            {account?.card_id ? (
              <>
                {"Carte "}
                <Kbd>{"#" + account?.card_id}</Kbd>
              </>
            ) : (
              "Carte non disponible"
            )}
            {`)`}
          </CardDescription>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader className="borne:grid-cols-1!">
          <CardTitle>
            {"Solde actuel : "}
            {typeof account?.balance === "number"
              ? formatPrice(account?.balance)
              : "Non disponible"}
          </CardTitle>
          <CardDescription>
            {`Tarifiction `}
            {account?.price_role ? (
              <PriceBadge price_role={account?.price_role} />
            ) : (
              "Non disponible"
            )}
            {` • Nombre d'étoiles : ${account?.points ?? "0"} `}
            <IconStarFilled className="inline size-4" />
          </CardDescription>
          <CardAction className="my-auto borne:hidden">
            <RefillDialog />
          </CardAction>
        </CardHeader>
      </Card>
    </>
  )
}
