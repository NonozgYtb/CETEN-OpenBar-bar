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
import { Transaction, TransactionState } from "@/lib/api"
import { apis, QueryTag, toUrl } from "@/components/providers/base-provider"
import { GenericAvatar } from "@/components/ui/avatar"
import { getFullName } from "@/components/providers/accounts-provider"
import { formatDate, formatPrice } from "@/lib/utils"
import {
  IconChecks,
  IconClock,
  IconReceiptRefund,
  IconX,
} from "@tabler/icons-react"
import { Separator } from "@/components/ui/separator"
import {
  TransactionStateBadge,
  TransactionSupportBadge,
} from "@/components/pages/commandes/transaction-badge"
import { toast, ToastType } from "@/components/ui/toast"
import { useQueryClient } from "@tanstack/react-query"
import { Tooltiped } from "@/components/ui/tooltip"

const TransactionDialog = createCallable<{ transaction: Transaction }, {}>(
  ({ call, transaction }) => {
    const queryClient = useQueryClient()

    const end = () => call.end({})
    const actionConfig = {
      cancel: {
        type: TransactionState.TransactionCanceled,
        adjective: "annulée",
        name: "l'annulation",
      },
      finish: {
        type: TransactionState.TransactionFinished,
        adjective: "terminée",
        name: "la finalisation",
      },
      wait: {
        type: TransactionState.TransactionStarted,
        adjective: "remise en attente",
        name: "la remise en attente",
      },
    } as const
    const endWithAction = async (action: "cancel" | "finish" | "wait") => {
      const changeItems = (): Promise<unknown> =>
        Promise.all(
          transaction.items
            .filter((item) => item.state !== actionConfig[action].type)
            .map((item) =>
              apis.transactions.patchTransactionItemId(
                transaction.account_id,
                transaction.id,
                item.item_id,
                actionConfig[action].type
              )
            )
        )
      const changeTransaction = (): Promise<unknown> =>
        apis.transactions.patchTransactionId(
          transaction.account_id,
          transaction.id,
          actionConfig[action].type
        )
      ;(action === "wait" ? changeTransaction() : changeItems())
        .then(() => (action === "wait" ? changeItems() : changeTransaction()))
        .then(() =>
          toast.add({
            title: `Transaction ${actionConfig[action].adjective}`,
            description: `La transaction a été ${actionConfig[action].adjective} avec succès.`,
            id: `transaction-${transaction.id}-${action}`,
            type: ToastType.SUCCESS,
          })
        )
        .catch(() =>
          toast.add({
            title: `Erreur lors de la ${actionConfig[action].name} de la transaction`,
            description: `Une erreur est survenue lors de la ${actionConfig[action].name} de la transaction.`,
            id: `transaction-${transaction.id}-${action}-error`,
            type: ToastType.ERROR,
          })
        )
        .finally(() => {
          queryClient.invalidateQueries({
            queryKey: [QueryTag.TransactionsGetAll],
          })
          call.end({})
        })
    }
    return (
      <Dialog open={!call.ended} defaultOpen onOpenChange={end}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[80%]"
          overlayProps={{
            onClick: end,
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-4">
              <GenericAvatar
                className="size-12 rounded-lg"
                first_name={transaction.account_name}
                picture={toUrl(transaction.account_google_picture!)}
              />
              <span className="truncate font-medium">
                {transaction.account_name}
              </span>
              <span className="ml-auto text-sm text-muted-foreground">
                {formatDate(transaction.created_at)}
              </span>
              <TransactionSupportBadge
                is_remote={transaction.is_remote}
                staff
              />
              <DialogClose
                onClick={end}
                variant={"outline"}
                buttonRender
                buttonProps={{ size: "icon" }}
              >
                <IconX className="size-6" />
              </DialogClose>
            </DialogTitle>
          </DialogHeader>
          <div className="-mx-6">
            <Separator />
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-evenly gap-4 text-lg">
            {transaction.items.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center gap-2"
              >
                <img
                  key={`${item.item_id}-${i}`}
                  src={toUrl(item.picture_uri)}
                  alt={item.item_name}
                  className="size-24 rounded-md bg-background object-contain p-2 transition-transform hover:scale-250"
                />
                <span>{item.item_name}</span>
                <span className="font-bold text-muted-foreground">
                  &times; {item.item_amount}
                </span>
              </div>
            ))}
          </div>
          <div className="-mx-6">
            <Separator />
          </div>
          <div className="flex items-center justify-center gap-4">
            <span className="text-lg text-muted-foreground">Total :</span>
            <span className="text-lg font-bold">
              {formatPrice(transaction.total_cost)}
            </span>
            <span className="text-lg text-muted-foreground">{"•"}</span>
            <span className="text-lg text-muted-foreground">Statut :</span>
            <TransactionStateBadge
              state={transaction.state}
              staff
              size={"big"}
            />
          </div>
          <div className="-mx-6">
            <Separator />
          </div>
          <DialogFooter className="flex-warp flex items-center justify-center gap-4">
            <Tooltiped tooltip="Annuler la validation d'une commande, cela remettra la commande en attente.">
              <DialogClose
                disabled={
                  transaction.state != TransactionState.TransactionFinished
                }
                onClick={() =>
                  transaction.state != TransactionState.TransactionFinished ||
                  endWithAction("wait")
                }
                variant={"warning"}
                buttonRender
                className="flex-1"
              >
                <IconClock />
                {" Remettre en attente"}
              </DialogClose>
            </Tooltiped>
            <Tooltiped tooltip="Rembourser une commande, cela annulera la commande et remboursera le client.">
              <DialogClose
                disabled={
                  transaction.state == TransactionState.TransactionFinished ||
                  transaction.state == TransactionState.TransactionCanceled
                }
                onClick={() =>
                  transaction.state == TransactionState.TransactionFinished ||
                  transaction.state == TransactionState.TransactionCanceled ||
                  endWithAction("cancel")
                }
                variant={"destructive"}
                buttonRender
                className="flex-1"
              >
                <IconReceiptRefund />
                {" Annuler & rembourser"}
              </DialogClose>
            </Tooltiped>
            <Tooltiped tooltip="Terminer une commande, cela validera la commande et la marquera comme terminée.">
              <DialogClose
                disabled={
                  transaction.state == TransactionState.TransactionFinished ||
                  transaction.state == TransactionState.TransactionCanceled
                }
                onClick={() => {
                  transaction.state == TransactionState.TransactionFinished ||
                    transaction.state == TransactionState.TransactionCanceled ||
                    endWithAction("finish")
                }}
                variant={"default"}
                buttonRender
                className="flex-1"
              >
                <IconChecks />
                {" Commande donnée"}
              </DialogClose>
            </Tooltiped>
            <DialogClose
              onClick={end}
              variant={"outline"}
              buttonRender
              className="flex-1"
            >
              Retour
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  },
  1000
)

TransactionDialog.displayName = "TransactionDialog"
export { TransactionDialog }
