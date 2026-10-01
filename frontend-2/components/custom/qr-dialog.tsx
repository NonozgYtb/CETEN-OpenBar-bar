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
import { useEffect, useMemo, useState } from "react"
import { ReadyState } from "react-use-websocket"
import { apis } from "../providers/base-provider"
import { toast, ToastType } from "../ui/toast"
import { IconCheck, IconLoader2 } from "@tabler/icons-react"
import { Badge } from "../ui/badge"

enum QRState {
  WAITING = "waiting",
  SCANNED = "scanned",
  CONNECTED = "connected",
  ERROR = "error",
}

const QRCall = createCallable<{ card_pin: string }, {}>(
  ({ call, card_pin }) => {
    const qrWS = useWS("wss://bar-api.nonozg.ovh/account/qr")
    const [qrContent, setQrContent] = useState<string | null>(null)
    const lastMessage = useMemo(() => {
      const data = qrWS.lastMessage?.data
      if (!data) return QRState.WAITING
      if (data === "scanned") return QRState.SCANNED
      if (data === "connected") return QRState.CONNECTED
      return QRState.ERROR
    }, [qrWS.lastMessage])
    const state = useMemo(() => {
      const getBadgeConfig = () => {
        switch (qrWS.readyState) {
          case ReadyState.CONNECTING:
            return { variant: "outline", label: "Connexion..." }

          case ReadyState.CLOSING:
          case ReadyState.CLOSED:
            return { variant: "destructive", label: "Déconnecté" }

          case ReadyState.OPEN:
            if (!qrContent)
              return { variant: "secondary", label: "Génération du QRCode..." }

            switch (lastMessage) {
              case QRState.WAITING:
                return {
                  variant: "outline",
                  label: "En attente de scan du QRCode...",
                }
              case QRState.SCANNED:
                return { variant: "secondary", label: "Connexion en cours..." }
              case QRState.CONNECTED:
                return { variant: "default", label: "Compte lié avec succès" }
              case QRState.ERROR:
                return {
                  variant: "destructive",
                  label: "Erreur lors de la connexion",
                }
            }
            break
        }
      }
      const { variant, label } = getBadgeConfig() || {
        variant: "outline",
        label: "Statut inconnu",
      }
      return <Badge variant={variant as any}>{label}</Badge>
    }, [qrWS.readyState, qrContent, lastMessage])
    useEffect(() => {
      if (qrWS.readyState === ReadyState.OPEN) {
        apis.auth
          .getAccountQR({ card_pin })
          .then((e) => {
            if (!e.data) throw new Error("No QR code returned")
            setQrContent(e.data)
          })
          .catch((err) => {
            call.end({})
            toast.add({
              type: ToastType.ERROR,
              id: "qr-error",
              title: "Erreur : Mauvais code PIN ou erreur de génération QRCode",
              description:
                err.response?.data?.message || "Une erreur est survenue",
            })
          })
      }
      if (lastMessage === QRState.CONNECTED) setTimeout(end, 2000)
    }, [qrWS.readyState, lastMessage])
    const end = () => {
      call.end({})
    }
    return (
      <Dialog open={!call.ended} defaultOpen onOpenChange={end}>
        <DialogContent
          overlayProps={{
            onClick: end,
          }}
        >
          <DialogHeader>
            <DialogTitle>QRCode - Lier mon compte TN.net</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4">
            <div
              className="grid size-64 place-items-center rounded-lg bg-white bg-contain bg-center"
              style={{
                backgroundImage:
                  qrContent && lastMessage !== QRState.CONNECTED
                    ? `url(data:image/png;base64,${qrContent})`
                    : undefined,
              }}
            >
              {!qrContent && (
                <IconLoader2 size={64} className="animate-spin text-primary" />
              )}
              {lastMessage === QRState.CONNECTED && (
                <IconCheck size={64} className="text-primary" />
              )}
            </div>
            {state}
          </div>
          <DialogFooter>
            <DialogClose onClick={end} variant={"destructive"} buttonRender>
              Annuler
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
  1000
)

QRCall.displayName = "QRCall"
export { QRCall }
