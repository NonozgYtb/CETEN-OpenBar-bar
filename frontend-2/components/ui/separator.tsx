"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"
import { cn } from "cn"

function Separator({
  className,
  orientation = "horizontal",
  ...props
}: SeparatorPrimitive.Props) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        className
      )}
      {...props}
    />
  )
}

function SeparatorWithText({
  className,
  orientation = "horizontal",
  children,
  ...props
}: SeparatorPrimitive.Props & { children: React.ReactNode }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={"horizontal"}
      className={cn(className, "flex items-center gap-2")}
      {...props}
    >
      <div className="h-px w-full flex-1 shrink-0 bg-border data-vertical:w-px" />
      <span className="px-2 text-sm text-muted-foreground text-center">{children}</span>
      <div className="h-px w-full flex-1 shrink-0 bg-border data-vertical:w-px" />
    </SeparatorPrimitive>
  )
}

export { Separator, SeparatorWithText }
