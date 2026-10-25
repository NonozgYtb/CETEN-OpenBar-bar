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
import { Button } from "@/components/ui/button"
import { BaseSyntheticEvent, useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { usePanelType } from "@/components/global-provider"

export type PinResponse =
  | {
      pin: string
      ok: true
    }
  | {
      pin: null
      ok: false
    }

const PinCall = createCallable<{ customMessage?: string }, PinResponse>(
  ({ call, ...props }) => {
    const [pin, setPin] = useState("")
    const panelType = usePanelType()
    const validate = (e: BaseSyntheticEvent) => {
      if (pin.length === 0) return
      e.preventDefault()
      e.stopPropagation()
      call.end({
        pin,
        ok: true,
      })
    }
    useEffect(() => {
      if (call.ended) return
      const elem = document.getElementById("pin")
      console.log(elem)
      if (elem) {
        console.log("FOCUS PIN", elem.focus())
      }
    }, [call.ended])
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
            <DialogTitle>
              {props.customMessage || "Entrez votre code PIN"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={validate} autoComplete="one-time-code">
            <Input
              tabIndex={-1}
              autoFocus
              autoComplete="one-time-code"
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              value={pin}
              pattern="[0-9]*"
              onChange={(e) => setPin(e.target.value.replaceAll(/[^0-9]/g, ""))}
              className="mb-4 h-auto! p-4! text-center text-3xl! borne:text-5xl!"
              onKeyDown={(e) => {
                if (e.key === "Enter") validate(e)
              }}
            />
          </form>
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
              variant={"outline"}
              buttonRender
            >
              Annuler
            </DialogClose>
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

export const askPin = (message?: string) =>
  PinCall.call({
    customMessage: message,
  }).catch((): PinResponse => ({ ok: false, pin: null }))
