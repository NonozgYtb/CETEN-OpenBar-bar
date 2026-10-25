"use client"

import * as React from "react"

import { NavMain } from "@/components/layout/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useSetPanelType_DO_NOT_USE } from "@/components/global-provider"
import { useCategoryList } from "@/components/providers/items-provider"
import { Route } from "next"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const setV = useSetPanelType_DO_NOT_USE()
  const { data } = useCategoryList()
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="justify-center p-0!">
        <SidebarMenu className="h-(--header-height) w-full borne:h-(--header-borne-height)">
          <SidebarMenuItem className="h-full w-full">
            <SidebarMenuButton
              /* render={<a href="#" />} */
              className="h-full w-full p-1"
              onClick={() => setV.setValue()}
            >
              <img
                className="h-full w-full object-contain"
                src="/logo-small.webp"
                alt="OpenBar"
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          imageSidebar
          items={
            data?.map((category) => ({
              title: category.name,
              url: `/category/${category.id}` as Route,
              icon: category.picture_uri,
            })) || []
          }
        />
        {/* <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter> */}
    </Sidebar>
  )
}
