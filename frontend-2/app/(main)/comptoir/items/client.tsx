"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import { StockTableContent } from "@/components/pages/comptoir/stock/stock-table"

export const ComptoirStock = () => {
  return (
    <InsetLayout
      pageTitle={"Comptoir • Stock"}
      className="flex h-full flex-col gap-4 md:gap-6"
    >
      <div className="h-full w-full p-4">
        <StockTableContent />
      </div>
    </InsetLayout>
  )
}
