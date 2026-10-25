"use client"

import { InsetLayout } from "@/components/layout/inset-layout"
import { useCategoryList } from "@/components/providers/items-provider"
import { useParams } from "next/navigation"
import { MainContent } from "./client.main"
import { AsideBar } from "./client.aside"

export default function CategoryPage() {
  const { id } = useParams()
  const category = useCategoryList().data?.find((c) => c.id === id)

  return (
    <InsetLayout pageTitle={category?.name || "Catégorie"}>
      <div className="h-full w-full">
        <div className="grid h-full w-full grid-rows-[1fr_auto] gap-4 px-4 @2xl/main:grid-cols-[3fr_minmax(28rem,1fr)] @2xl/main:grid-rows-[1fr]">
          <MainContent />
          <AsideBar />
        </div>
      </div>
    </InsetLayout>
  )
}
