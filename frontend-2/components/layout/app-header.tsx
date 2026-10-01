"use client"

import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

import {
  IconDesk,
  IconFileInvoice,
  IconHome,
  IconLogout,
  IconStarFilled,
  IconUserCircle,
} from "@tabler/icons-react"

import { GenericAvatar } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenuButton } from "@/components/ui/sidebar"
import { Badge, BadgeVariant } from "../ui/badge"
import { getFullName, useAccount } from "../providers/accounts-provider"
import { AccountPriceRole } from "../../lib/api/api"
import { apis } from "../providers/base-provider"
import { redirect, useRouter } from "next/navigation"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { Button, LinkButton } from "../ui/button"
import { usePanelType } from "../global-provider"
import { MouseEvent } from "react"
import { askNFC } from "../custom/nfc-dialog"
import { toast } from "../ui/toast"
import { askPin } from "../custom/pin-dialog"

export const PriceBadge = ({
  price_role,
}: {
  price_role: AccountPriceRole
}) => {
  const priceRoleLabels: Record<
    AccountPriceRole,
    { label: string; badgeVariant: BadgeVariant; hidden?: boolean }
  > = {
    coutant: {
      label: "Coutant",
      badgeVariant: "destructive",
    },
    staff_bar: {
      label: "Staff Bar",
      badgeVariant: "secondary",
    },
    privilegies: {
      hidden: true,
      label: "Privilegiés",
      badgeVariant: "destructive",
    },
    menu: {
      hidden: true,
      label: "Menu",
      badgeVariant: "outline",
    },
    ceten: {
      label: "Ceten",
      badgeVariant: "default",
    },
    externe: {
      label: "Externe",
      badgeVariant: "outline",
    },
  }

  if (!priceRoleLabels[price_role] || priceRoleLabels[price_role].hidden)
    return null
  return (
    <Badge variant={priceRoleLabels[price_role].badgeVariant}>
      {priceRoleLabels[price_role].label}
    </Badge>
  )
}

export function AppHeader({ pageTitle }: { pageTitle?: string }) {
  const panelType = usePanelType()
  const router = useRouter()
  const { data: user } = useAccount()

  const AskButton = ({
    onClick,
    ...props
  }: React.ComponentProps<typeof LinkButton>) => {
    const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
      console.log(e)
      if (onClick) return onClick(e)
      if (panelType !== "borne") return
      e.preventDefault()
      e.stopPropagation()
      askNFC().then(async (nfc) => {
        console.log(nfc)
        if (!nfc.ok)
          return toast.add({
            type: "warning",
            id: "nfc-cancelled",
            title: "Action annulée",
            description: "Vous devez scanner votre carte pour continuer.",
          })
        const pin = await askPin()
        if (!pin.ok)
          return toast.add({
            type: "warning",
            id: "pin-cancelled",
            title: "Action annulée",
            description: "Vous devez entrer votre code PIN pour continuer.",
          })

        const res = await apis.auth
          .connectCard(
            { card_id: nfc.uid, card_pin: pin.pin },
            { withCredentials: true }
          )
          .catch(() => null)

        if (res && res.data.account) router.push(props.href as any)
        else
          toast.add({
            type: "error",
            id: "auth-error",
            title: "Erreur d'authentification",
            description: "Votre carte ou votre code PIN est incorrect.",
          })
      })
    }

    return <LinkButton {...props} onClick={handleClick} />
  }

  const staffNav = [
    {
      href: "/",
      label: "Accueil",
      icon: IconHome,
    },
    {
      href: "/comptoir",
      label: "Comptoir",
      icon: IconDesk,
    },
  ] as const
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) borne:h-(--header-borne-height) borne:group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-borne-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 my-2" />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          {staffNav.map((item) => (
            <AskButton
              key={item.href}
              href={item.href}
              variant="default"
              className="hidden gap-1 px-2 py-1 text-sm md:flex"
            >
              <item.icon className="size-4 borne:size-8" />
              <span className="borne:hidden">{item.label}</span>
            </AskButton>
          ))}
          <Button
            onClick={() => apis.auth.logout().then(() => redirect("/auth"))}
            className="hidden gap-1 px-2 py-1 text-sm borne:md:flex"
            variant="destructive"
          >
            <IconLogout className="size-4 borne:size-8" />
            <span className="borne:hidden">Se déconnecter</span>
          </Button>
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="unsized"
                    className="py-2! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground borne:p-4!"
                  />
                }
              >
                <div className="grid flex-1 text-right text-sm leading-tight">
                  <span className="truncate font-medium">
                    <Badge
                      className="mr-2"
                      variant={
                        (user.account?.balance ?? 0) >= 0
                          ? "default"
                          : "destructive"
                      }
                    >
                      {formatPrice(user.account?.balance ?? 0)}
                    </Badge>
                    {user.account?.first_name}
                  </span>
                </div>
                <GenericAvatar account={user.account} />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1 text-left text-sm">
                      <GenericAvatar account={user.account} />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">
                          {getFullName(user.account)}
                          <Badge
                            className="ml-2"
                            variant={
                              (user.account?.balance ?? 0) >= 0
                                ? "default"
                                : "destructive"
                            }
                          >
                            {formatPrice(user.account?.balance ?? 0)}
                          </Badge>
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {user.account?.email_address}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center justify-center gap-2 px-1 py-1 text-center text-sm">
                      <span>Prix :</span>
                      <PriceBadge
                        price_role={user.account?.price_role ?? "externe"}
                      />
                      <span>•</span>
                      <span>
                        {user.account?.points ?? "0"}
                        <IconStarFilled className="mb-px ml-0.5 inline size-4" />
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    render={(props) => <Link href="/me" {...props} />}
                  >
                    <IconUserCircle />
                    Mon compte • Mon solde
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={(props) => <Link href="/commandes" {...props} />}
                  >
                    <IconFileInvoice />
                    Mes commandes
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <div className="flex flex-wrap items-center justify-center gap-2 md:hidden">
                  {staffNav.map((item) => (
                    <AskButton
                      key={item.href}
                      href={item.href}
                      variant="default"
                      className="px-2 py-1 text-sm"
                    >
                      <item.icon className="size-4 borne:size-8" />
                      <span>{item.label}</span>
                    </AskButton>
                  ))}
                </div>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() =>
                    apis.auth.logout().then(() => redirect("/auth"))
                  }
                >
                  <IconLogout />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
