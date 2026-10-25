"use client"

import { cn } from "@/lib/utils"

import { AButton, Button } from "@/components/ui/button"
import { Field, FieldGroup } from "@/components/ui/field"
import { IconBrandGoogleFilled, IconNfc, IconX } from "@tabler/icons-react"
import { askNFC, useNFCWS } from "@/components/custom/nfc-dialog"
import { ReadyState } from "react-use-websocket"
import { askPin } from "@/components/custom/pin-dialog"
import { toastError, ToastId } from "@/components/ui/toast"
import { useRouter } from "next/navigation"
import { apis } from "@/components/providers/base-provider"

export function AuthPage({ className }: { className?: string }) {
  const domain =
    typeof window === "undefined" ? null : new URL("/me", window.location.href)
  const router = useRouter()
  const auth = async (nfcUID: string) => {
    if (!nfcUID) return
    const pin = await askPin()
    if (!pin.ok) return

    const res = await apis.auth
      .connectCard(
        { card_id: nfcUID, card_pin: pin.pin },
        {
          withCredentials: true,
        }
      )
      .then((e) => {
        if (!e || !e.data.account) throw new Error()
        return e.data.account
      })
      .catch((err) => {
        console.log("ERR", err)
        toastError(ToastId.Auth_Error, "Erreur d'authentification")
        return null
      })
    if (!res) return
    router.push(`/`)
  }
  const { nfcWS } = useNFCWS(({ data }) => {
    if (!data) return
    try {
      const parsed = JSON.parse(data)
      if ("uid" in parsed) auth(parsed.uid)
    } catch (e) {
      console.error("Erreur lors de l'analyse du message NFC :", e)
    }
  })
  const isNfcAvailable = nfcWS.readyState === ReadyState.OPEN
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex items-center justify-center gap-4 md:justify-start">
          <img
            src="/logo-small.webp"
            alt="OpenBar Logo"
            className="h-8 rounded-lg"
          />
          <IconX className="size-4 text-muted-foreground" />
          <span className="text-2xl font-bold">OpenBar</span>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6", className)}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Se connecter à OpenBar</h1>
                  <p className="text-sm text-balance text-muted-foreground">
                    {`Si vous n'avez pas de compte, passez d'abord votre carte à une borne au bar.`}
                  </p>
                </div>
                <Field>
                  <AButton
                    href={`${process.env.NEXT_PUBLIC_API}/auth/google?r=${encodeURIComponent(domain?.toString() || "")}`}
                    type="button"
                    className="gap-4!"
                  >
                    <IconBrandGoogleFilled />
                    Se connecter avec TN.net
                  </AButton>
                  <Button
                    variant={"outline"}
                    type="button"
                    className="gap-4!"
                    disabled={!isNfcAvailable}
                    onClick={() => {
                      if (!isNfcAvailable) return
                      askNFC(undefined, true)
                    }}
                  >
                    <IconNfc />
                    Se connecter par NFC
                  </Button>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/background.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.5]"
        />
      </div>
    </div>
  )
}
