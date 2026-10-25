"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import { Button } from "@/components/ui/button"
import { PendingRefills } from "@/components/pages/account/pending-refills"
import AccountCard from "@/components/pages/account/account-card"
import { RefillCard } from "@/components/pages/account/refill-card"
import { askPin } from "@/components/custom/pin-dialog"
import {
  toastError,
  ToastId,
  toastSuccess,
  toastWarning,
} from "@/components/ui/toast"
import { apis } from "@/components/providers/base-provider"
import { QRCall } from "@/components/custom/qr-dialog"

export default function MePage() {
  const askPinReinit = async () => {
    const oldPin = await askPin("Votre ANCIEN code PIN")
    if (!oldPin.ok) return
    const newPin = await askPin("Votre NOUVEAU code PIN")
    if (!newPin.ok) return
    const confirmPin = await askPin("Confirmez votre NOUVEAU code PIN")
    if (!confirmPin.ok) return
    if (newPin.pin !== confirmPin.pin)
      return toastWarning(
        ToastId.Auth_PinMismatch,
        "Les codes PIN ne correspondent pas"
      )

    apis.accounts
      .patchAccountPin({
        old_card_pin: oldPin.pin,
        new_card_pin: newPin.pin,
      })
      .then((e) => {
        if (!e.data.account) throw new Error("No account returned")
        return toastSuccess(
          ToastId.Auth_PinChangeSuccess,
          "Code PIN changé avec succès"
        )
      })
      .catch((err) => {
        console.error(err)
        toastError(
          ToastId.Auth_PinChangeError,
          "Erreur lors du changement de code PIN",
          err.response?.data?.message || "Une erreur est survenue"
        )
      })
  }
  const askAccountRelink = async () => {
    const oldPin = await askPin()
    if (!oldPin.ok) return
    QRCall.call({ card_pin: oldPin.pin })
  }
  return (
    <InsetLayout pageTitle={"Mon compte"}>
      <div className="h-full w-full overflow-y-auto">
        <div className="grid gap-4 p-4 lg:grid-cols-2">
          <PendingRefills />

          {/* Account/Balence card */}
          <AccountCard />

          {/* Actions */}
          <div className="col-span-full flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <Button variant="light" onClick={askPinReinit}>
              Changer mon code PIN
            </Button>
            <Button variant="light" onClick={askAccountRelink}>
              Reconnecter mon compte TN.net
            </Button>
          </div>

          {/* Refills */}
          <RefillCard />
        </div>
      </div>
    </InsetLayout>
  )
}
