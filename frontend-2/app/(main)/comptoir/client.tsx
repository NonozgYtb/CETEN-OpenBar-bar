"use client"

import { usePanelType } from "@/components/global-provider"
import { InsetLayout } from "@/components/layout/inset-layout"
import { useState } from "react"
import { NFCDialog } from "@/components/custom/nfc-dialog"
import { askPin } from "@/components/custom/pin-dialog"
import { apis } from "@/components/providers/base-provider"

export const ComptoirIndex = () => {
  return (
    <InsetLayout pageTitle={"Comptoir"}>
      <div className="h-full w-full"></div>
    </InsetLayout>
  )
}

export const ComptoirLayout = ({ children }: { children: React.ReactNode }) => {
  const panelType = usePanelType()
  const [logged, setLogged] = useState(false)
  if (panelType !== "borne") return children
  if (logged) return children
  return (
    <NFCDialog
      noCancel
      result={(nfc) => {
        if (!nfc.ok) return
        askPin()
          .then((pin) =>
            !pin.ok
              ? null
              : apis.auth.connectCard(
                  { card_id: nfc.uid, card_pin: pin.pin },
                  {
                    withCredentials: true,
                    validateStatus: () => true,
                  }
                )
          )
          .then((e) => {
            if (e?.data.account) setLogged(true)
          })
          .catch(() => void 0)
      }}
    />
  )
}
