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

import {
  GenericAvatar,
} from "@/components/ui/avatar"
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
import { getFullName, useAccount } from "../providers/account-provider"
import { AccountPriceRole } from "../../lib/api/api"
import { apis } from "../providers/base-provider"
import { redirect } from "next/navigation"
import Link from "next/link"
import { formatPrice } from "@/lib/utils"
import { LinkButton } from "../ui/button"

export const PriceBadge = ({
  price_role,
}: {
  price_role: AccountPriceRole
}) => {
  const priceRoleLabels: Record<
    AccountPriceRole,
    { label: string; badgeVariant: BadgeVariant }
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
      label: "Privilegiés",
      badgeVariant: "destructive",
    },
    menu: {
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

  return (
    <Badge variant={priceRoleLabels[price_role].badgeVariant}>
      {priceRoleLabels[price_role].label}
    </Badge>
  )
}

export function AppHeader({ pageTitle }: { pageTitle?: string }) {
  const { data: user } = useAccount()
  const userLabel = user?.account
    ? getFullName(user.account)
        .split(" ")
        .filter((e) => /^[A-Za-z]$/.test(e[0]))
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : null
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) borne:h-(--header-borne-height) borne:group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-borne-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 my-2" />
        <h1 className="text-base font-medium">{pageTitle}</h1>
        <div className="ml-auto flex items-center gap-2">
          <LinkButton
            href="/"
            variant="default"
            className="hidden gap-1 px-2 py-1 text-sm md:flex"
          >
            <IconHome className="size-6 borne:size-8" />
            <span className="borne:hidden">Accueil</span>
          </LinkButton>
          <LinkButton
            href="/comptoir"
            variant="default"
            className="hidden gap-1 px-2 py-1 text-sm md:flex"
          >
            <IconDesk className="size-6 borne:size-8" />
            <span className="borne:hidden">Comptoir</span>
          </LinkButton>
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
                  <LinkButton
                    href="/"
                    variant="default"
                    className="px-2 py-1 text-sm"
                  >
                    <IconHome className="size-6 borne:size-8" />
                    <span>Accueil</span>
                  </LinkButton>
                  <LinkButton
                    href="/comptoir"
                    variant="default"
                    className="px-2 py-1 text-sm"
                  >
                    <IconDesk className="size-6 borne:size-8" />
                    <span>Comptoir</span>
                  </LinkButton>
                </div>
                <DropdownMenuSeparator className="md:hidden" />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => {
                    apis.auth.logout().then(() => {
                      redirect("/auth")
                    })
                  }}
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
