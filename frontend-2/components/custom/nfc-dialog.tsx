"use client"

import { createCallable } from "react-call"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useWS } from "@/hooks/use-websocket"
import { usePanelType } from "@/components/global-provider"
import { useAccount } from "@/components/providers/accounts-provider"
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item"
import { Kbd } from "@/components/ui/kbd"

export type NFCResponse =
  | {
      uid: string
      ok: true
    }
  | {
      uid: null
      ok: false
    }

export const useNFCWS = (onMessage?: (event: MessageEvent) => void) => {
  const panelType = usePanelType()
  const nfcWS = useWS(
    `${process.env.NEXT_PUBLIC_LOCAL_API?.replace(/^http/, "ws")}/ws`,
    true,
    panelType !== "borne" ? 1 : 10,
    panelType !== "borne",
    onMessage
  )
  return { nfcWS, panelType }
}

export const NFCDialog = ({
  noCancel = false,
  customMessage = "Scanner votre carte",
  disableAutofill = false,
  result = undefined as ((result: NFCResponse) => void) | undefined,
  shown = true,
}) => {
  const { panelType } = useNFCWS(({ data }) => {
    if (!data) return
    try {
      if ("uid" in JSON.parse(data))
        result?.({ uid: JSON.parse(data).uid, ok: true })
    } catch (e) {
      void e
    }
  })
  const end = () => result?.({ ok: false, uid: null })
  const account = useAccount()
  const hasFilledCardId = !!(
    !disableAutofill &&
    panelType !== "borne" &&
    account?.data?.account?.card_id
  )
  return (
    <Dialog open={shown} defaultOpen onOpenChange={end}>
      <DialogContent
        showCloseButton={!noCancel}
        overlayProps={{
          onClick: end,
        }}
      >
        <DialogHeader>
          <DialogTitle>{`NFC - ${customMessage}`}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="grid size-64 place-items-center rounded-lg bg-background bg-contain bg-center p-4">
            <span className="text-lg">{"En attente d'un scan NFC"}</span>
          </div>
          {hasFilledCardId && (
            <Item
              variant="outline"
              className="cursor-pointer hover:bg-input/30"
              onClick={() =>
                result?.({
                  uid: String(account?.data?.account?.card_id),
                  ok: true,
                })
              }
            >
              <ItemContent>
                <ItemTitle>
                  {"Carte liée : "}
                  <Kbd>{`#${account?.data?.account?.card_id}`}</Kbd>
                </ItemTitle>
                <ItemDescription>
                  Vous êtes déja connecté!
                  <br />
                  Vous pouvez utiliser la carte liée avec votre compte.
                </ItemDescription>
              </ItemContent>
            </Item>
          )}
        </div>
        {(hasFilledCardId || !noCancel) && (
          <DialogFooter>
            {hasFilledCardId && (
              <DialogClose
                onClick={() =>
                  result?.({
                    uid: String(account?.data?.account?.card_id),
                    ok: true,
                  })
                }
                variant={"default"}
                buttonRender
              >
                Utiliser ma carte
              </DialogClose>
            )}
            {!noCancel && (
              <DialogClose onClick={end} variant={"destructive"} buttonRender>
                Annuler
              </DialogClose>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
}

const NFCCall = createCallable<
  { customMessage?: string; disableAutofill?: boolean },
  NFCResponse
>(
  ({
    call,
    customMessage = "Scanner votre carte",
    disableAutofill = false,
  }) => (
    <NFCDialog
      customMessage={customMessage}
      disableAutofill={disableAutofill}
      result={(e) => call.end(e)}
      shown={!call.ended}
    />
  ),
  1000
)

NFCCall.displayName = "NFCCall"
export { NFCCall }

export const askNFC = (message?: string, disableAutofill?: boolean) =>
  NFCCall.call({
    customMessage: message,
    disableAutofill,
  }).catch((): NFCResponse => ({ ok: false, uid: null }))
