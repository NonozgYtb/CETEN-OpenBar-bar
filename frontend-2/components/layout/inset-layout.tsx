"use client";

import { ScrollArea } from "../ui/scroll-area"
import { AppHeader } from "./app-header"

export const InsetLayout = ({
  pageTitle,
  className = "flex h-full flex-col gap-4 py-4 md:gap-6",
  children,
}: {
  pageTitle?: string
  className?: string
  children?: React.ReactNode
}) => {
  return (
    <>
      <AppHeader pageTitle={pageTitle} />
      <ScrollArea className="flex h-full flex-1 flex-col overflow-auto">
        <div className="@container/main flex h-full flex-1 flex-col gap-2">
          <div className={className}>{children}</div>
        </div>
      </ScrollArea>
    </>
  )
}
