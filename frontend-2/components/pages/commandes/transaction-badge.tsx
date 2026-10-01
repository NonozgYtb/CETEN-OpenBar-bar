"use client"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { Transaction, TransactionState } from "@/lib/api"
import { IconDeviceDesktop, IconWorld } from "@tabler/icons-react"

export const transactionStateBadgeConfig: Record<
  TransactionState,
  {
    label: string
    variant: "default" | "destructive" | "secondary" | "outline"
  }
> = {
  started: {
    label: "Envoyée",
    variant: "default",
  },
  canceled: {
    label: "Annulée",
    variant: "destructive",
  },
  taken_care_of: {
    label: "Prise en charge",
    variant: "secondary",
  },
  finished: {
    label: "Terminée",
    variant: "outline",
  },
}

export const TransactionSupportBadge = ({
  is_remote,
  ...props
}: {
  is_remote?: boolean
}&Omit<BadgeProps, "variant"|"children">) => is_remote !== undefined && is_remote !== null ? (
    <Badge variant={is_remote ? "default" : "secondary"} {...props}> 
      {is_remote ? (
        <IconDeviceDesktop className="size-6" />
      ) : (
        <IconWorld className="size-6" />
      )}
      {is_remote ? "En ligne" : "Sur borne"}
    </Badge>
  ):null;

export const TransactionStateBadge = ({
  state,
}: {
  state: Transaction["state"]
}) => (
  <Badge variant={transactionStateBadgeConfig[state].variant}>
    {transactionStateBadgeConfig[state].label}
  </Badge>
)
