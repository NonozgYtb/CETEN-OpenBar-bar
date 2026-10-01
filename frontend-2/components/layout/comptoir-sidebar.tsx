"use client"

import * as React from "react"
import {
  IconCamera,
  IconCarFan,
  IconCashBanknote,
  IconDatabase,
  IconDesk,
  IconDoor,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconReceipt,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/layout/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { _useSetPanelType } from "../global-provider"
import { useCategoryList } from "../providers/items-provider"
import { NavSecondary } from "./nav-secondary"
import { askPin } from "../custom/pin-dialog"
import { toast, ToastType } from "../ui/toast"
import { askNFC } from "../custom/nfc-dialog"

enum Action {
  PORTE = "porte",
  VENTILATEUR = "ventilo",
  CAISSE = "caisse",
}

const labels: Record<Action, { valid: string; error: string }> = {
  [Action.PORTE]: {
    valid: "La porte a été ouverte avec succès.",
    error: "Une erreur est survenue lors de l'ouverture de la porte.",
  },
  [Action.VENTILATEUR]: {
    valid: "Le ventilateur a été allumé avec succès.",
    error: "Une erreur est survenue lors de l'allumage du ventilateur.",
  },
  [Action.CAISSE]: {
    valid: "La caisse a été ouverte avec succès.",
    error: "Une erreur est survenue lors de l'ouverture de la caisse.",
  },
}

export function ComptoirSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const setV = _useSetPanelType()
  const sendAction = async (action: Action) => {
    const nfcUid = await askNFC()
    if (!nfcUid.ok)
      return toast.add({
        type: ToastType.WARNING,
        id: "action-nfc-cancelled",
        title: "Action annulée",
        description:
          "Vous devez scanner votre carte pour effectuer cette action.",
      })
    const pin = await askPin()
    if (!pin.ok)
      return toast.add({
        type: ToastType.WARNING,
        id: "action-pin-cancelled",
        title: "Action annulée",
        description:
          "Vous devez entrer votre code PIN pour effectuer cette action.",
      })
    fetch(new URL(`/${action}`, process.env.NEXT_PUBLIC_LOCAL_API), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        card_id: nfcUid.uid,
        card_pin: pin.pin,
      }),
    })
      .then((res) => {
        if (res.ok) return res.json()
        throw new Error(`HTTP error! status: ${res.status}`)
      })
      .then(async (res) => {
        if ("success" in res && res.success)
          toast.add({
            type: ToastType.SUCCESS,
            id: `action-success-${action}`,
            title: labels[action].valid,
          })
        else throw new Error("Action failed")
      })
      .catch((err) => {
        console.error(err)
        toast.add({
          type: ToastType.ERROR,
          id: `action-error-${action}`,
          title: labels[action].error,
        })
      })
  }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="justify-center p-0!">
        <SidebarMenu className="h-(--header-height) w-full borne:h-(--header-borne-height)">
          <SidebarMenuItem className="h-full w-full">
            <SidebarMenuButton
              /* render={<a href="#" />} */
              className="h-full w-full p-1"
              onClick={() => setV.setValue()}
            >
              <img
                className="h-full w-full object-contain"
                src="/logo-small.webp"
                alt="OpenBar"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={[
            {
              title: "Comptoir",
              url: "/comptoir",
              icon: IconDesk,
            },
            {
              title: "Transactions",
              url: "/comptoir/transactions",
              icon: IconReceipt,
            },
            {
              title: "Stock / Produits",
              url: "/comptoir/items",
              icon: IconDatabase,
            }
          ]}
        />
        <NavMain
          forceVariant={"primary"}
          items={[
            {
              title: "Ouvrir porte",
              icon: IconDoor,
              onClick: () => sendAction(Action.PORTE),
            },
            {
              title: "Allumer ventilateur",
              icon: IconCarFan,
              onClick: () => sendAction(Action.VENTILATEUR),
            },
            {
              title: "Ouvrir caisse",
              icon: IconCashBanknote,
              onClick: () => sendAction(Action.CAISSE),
            },
          ]}
          className="mt-auto"
        />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  )
}
