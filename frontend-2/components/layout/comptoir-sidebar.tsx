"use client"

import * as React from "react"
import {
  IconCarFan,
  IconCashBanknote,
  IconDatabase,
  IconDesk,
  IconDoor,
  IconReceipt,
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
import { useSetPanelType_DO_NOT_USE } from "@/components/global-provider"
import { askPin } from "@/components/custom/pin-dialog"
import { toastError, ToastId, toastSuccess, toastWarning } from "@/components/ui/toast"
import { askNFC } from "@/components/custom/nfc-dialog"

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
  const setV = useSetPanelType_DO_NOT_USE()
  const sendAction = async (action: Action) => {
    const nfcUid = await askNFC()
    if (!nfcUid.ok)
      return toastWarning(
        ToastId.Auth_NFCCancelled,
        "Action annulée",
        "Vous devez scanner votre carte pour continuer."
      )
    const pin = await askPin()
    if (!pin.ok)
      return toastWarning(
        ToastId.Auth_PinCancelled,
        "Action annulée",
        "Vous devez entrer votre code PIN pour continuer."
      )
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
          return toastSuccess(
            ToastId.Custom,
            `Action ${action} réussie`,
            labels[action].valid,
            `action-success-${action}`
          )
        else throw new Error("Action failed")
      })
      .catch((err) => {
        console.error(err)
        toastError(
          ToastId.Custom,
          `Erreur lors de l'action ${action}`,
          labels[action].error,
          `action-error-${action}`
        )
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
            },
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
