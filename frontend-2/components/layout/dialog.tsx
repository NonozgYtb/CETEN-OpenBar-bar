import { createCallable } from "react-call"
import { MutationCall, useMutationFlow } from "react-call/mutation-flow"
import { Item, ItemContent, ItemMedia, ItemTitle } from "@/components/ui/item"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { useState } from "react"
import { Input } from "../ui/input"
import { usePanelType } from "../global-provider"

type PinResponse =
  | {
      pin: string
      ok: true
    }
  | {
      pin: null
      ok: false
    }

const PinCall = createCallable<{}, PinResponse>(
  ({ call, ...props }) => {
    const [pin, setPin] = useState("")
    const panelType = usePanelType()
    return (
      <Dialog
        open={!call.ended}
        defaultOpen
        onOpenChange={() => call.end({ pin: null, ok: false })}
      >
        <DialogContent
          className={panelType === "borne" ? "borne" : ""}
          overlayProps={{
            onClick: () =>
              call.end({
                pin: null,
                ok: false,
              }),
          }}
        >
          <DialogHeader>
            <DialogTitle>Entrez votre code PIN</DialogTitle>
          </DialogHeader>
          <Input
            type="text"
            value={pin}
            pattern="[0-9]*"
            onChange={(e) => setPin(e.target.value.replaceAll(/[^0-9]/g, ""))}
            className="mb-4 h-auto! p-4! text-center text-3xl! borne:text-5xl!"
          />
          <div className="grid grid-cols-3 grid-rows-4 gap-2">
            {Array.from({ length: 9 }, (_, i) => (
              <Button
                className="h-auto! px-4! py-6! text-3xl"
                key={i + 1}
                onClick={() => setPin(pin + (i + 1).toString())}
              >
                {i + 1}
              </Button>
            ))}
            <Button
              className="h-auto! px-4! py-6! text-3xl"
              onClick={() => setPin(pin.slice(0, -1))}
              variant={"secondary"}
            >
              ←
            </Button>
            <Button
              className="h-auto! px-4! py-6! text-3xl"
              onClick={() => setPin(pin + "0")}
            >
              0
            </Button>
            <Button
              className="h-auto! px-4! py-6! text-3xl"
              onClick={() => setPin("")}
              variant={"destructive"}
            >
              C
            </Button>
          </div>
          <DialogFooter>
            <DialogClose
              onClick={() =>
                call.end({
                  pin: null,
                  ok: false,
                })
              }
              render={<Button variant="outline">Annuler</Button>}
            />
            <Button
              disabled={pin.length === 0}
              onClick={() =>
                call.end({
                  pin,
                  ok: true,
                })
              }
              type="submit"
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
  1000
)

PinCall.displayName = "PinCall"
export { PinCall }
