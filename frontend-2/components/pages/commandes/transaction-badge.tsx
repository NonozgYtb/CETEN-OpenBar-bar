"use client"

import { Badge, BadgeProps } from "@/components/ui/badge"
import { Transaction, TransactionState } from "@/lib/api"
import { IconDeviceDesktop, IconWorld } from "@tabler/icons-react"

export const transactionStateBadgeConfig: Record<
  TransactionState,
  {
    label: string
    labelLowerCase: string
    variant: "default" | "destructive" | "secondary" | "outline"
  }
> = {
  started: {
    label: "Envoyée",
    labelLowerCase: "envoyée",
    variant: "default",
  },
  canceled: {
    label: "Annulée",
    labelLowerCase: "annulée",
    variant: "destructive",
  },
  taken_care_of: {
    label: "Prise en charge",
    labelLowerCase: "prise en charge",
    variant: "secondary",
  },
  finished: {
    label: "Terminée",
    labelLowerCase: "terminée",
    variant: "outline",
  },
}

export const transactionStateStaffBadgeConfig: Record<
  TransactionState,
  {
    label: string
    labelLowerCase: string
    variant: BadgeProps["variant"]
  }
> = {
  started: {
    label: "A traiter",
    labelLowerCase: "à traiter",
    variant: "warning",
  },
  canceled: {
    label: "Annulée",
    labelLowerCase: "annulée",
    variant: "destructive",
  },
  taken_care_of: {
    label: "Prise en charge",
    labelLowerCase: "prise en charge",
    variant: "secondary",
  },
  finished: {
    label: "Terminée",
    labelLowerCase: "terminée",
    variant: "default",
  },
}

export const TransactionSupportBadge = ({
  is_remote,
  staff = false,
  ...props
}: {
  is_remote?: boolean
  staff?: boolean
} & Omit<BadgeProps, "variant" | "children">) =>
  is_remote !== undefined && is_remote !== null ? (
    <Badge
      variant={staff ? "outline" : is_remote ? "default" : "secondary"}
      {...props}
    >
      {is_remote ? (
        <IconDeviceDesktop className="size-6" />
      ) : (
        <IconWorld className="size-6" />
      )}
      {is_remote ? "En ligne" : "Sur borne"}
    </Badge>
  ) : null

export const TransactionStateBadge = ({
  state,
  staff = false,
  size = "default",
  ...props
}: {
  state: Transaction["state"]
  staff?: boolean
} & Omit<BadgeProps, "variant" | "children">) => (
  <Badge
    variant={
      (staff ? transactionStateStaffBadgeConfig : transactionStateBadgeConfig)[
        state
      ].variant
    }
    size={size}
    {...props}
  >
    {(size === "big" ? "Commande " : "") +
      (staff ? transactionStateStaffBadgeConfig : transactionStateBadgeConfig)[
        state
      ][size === "big" ? "labelLowerCase" : "label"]}
  </Badge>
)
