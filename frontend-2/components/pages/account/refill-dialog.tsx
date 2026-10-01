"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useMemo, useState } from "react"
import { Field, FieldError } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apis } from "@/components/providers/base-provider"
import { Route } from "next"
import { toast, ToastType } from "@/components/ui/toast"
import { useRouter } from "next/navigation"

export const RefillDialog = () => {
  const router = useRouter()
  const [amountText, setAmountText] = useState<string>("10")
  const [amount, setAmount] = useState<number>(10)
  const message = useMemo(() => {
    try {
      const parsed = parseFloat(amountText)
      if (isNaN(parsed)) return "Montant invalide"
    } catch {
      return "Montant invalide"
    }
    if (amount < 0.5) return "Le montant minimum est de 0.50€"
  }, [amount, amountText])
  const [dialogOpen, setDialogOpen] = useState(false)
  const initiateRefill = async () => {
    if (message) return
    return apis.refills
      .startRemoteRefill(Math.floor(amount * 100), {
        withCredentials: true,
      })
      .then((resp) => {
        router.push(resp.data.redirect_url as Route)
      })
      .catch((reason) => {
        toast.add({
          id: "refill-error",
          type: ToastType.ERROR,
          title: "Erreur lors du rechargement",
          description: reason.message,
        })
        setTimeout(() => setDialogOpen(false), 1)
      })
  }
  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger render={<Button>Recharger</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Recharger mon compte</DialogTitle>
          <DialogDescription>
            Vous pouvez recharger votre compte avec HelloAsso. Le rechargement
            sera automatiquement validé.
            <br />
            <br />
            <b className="text-destructive">
              Pensez à retirer la contribution HelloAsso avant le paiement !
            </b>
          </DialogDescription>
        </DialogHeader>
        <Field>
          <Label htmlFor="refill-amount">Montant (en €)</Label>
          <Input
            id="refill-amount"
            name="name"
            type="number"
            min={0.5}
            step={0.5}
            value={amountText}
            onChange={(e) => {
              const value = e.target.value.toString().replace(/[^0-9.]/g, "")
              setAmountText(value)
              try {
                const parsed = parseFloat(value)
                if (!isNaN(parsed)) setAmount(parsed)
              } catch {}
            }}
            onBlur={(e) => {
              try {
                const parsed = parseFloat(
                  e.target.value.toString().replace(/[^0-9.]/g, "")
                )
                if (!isNaN(parsed)) {
                  setAmount(parsed)
                  setAmountText(parsed.toFixed(2))
                }
              } catch {}
            }}
          />
          {message && <FieldError>{message}</FieldError>}
        </Field>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <DialogClose buttonRender variant={"secondary"}>
            Annuler
          </DialogClose>
          <Button disabled={Boolean(message)} onClick={initiateRefill}>
            Recharger
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
