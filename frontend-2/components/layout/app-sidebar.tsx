"use client"

import * as React from "react"
import {
  IconCamera,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconHelp,
  IconReport,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react"

import { NavMain } from "@/components/layout/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { _useSetPanelType } from "../global-provider"
import { useCategoryList } from "../providers/category-provider"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const setV = _useSetPanelType()
  const { data } = useCategoryList()
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="justify-center p-0!">
        <SidebarMenu className="h-(--header-height) w-full borne:h-(--header-borne-height)">
          <SidebarMenuItem className="h-full w-full">
            <SidebarMenuButton
              render={<a href="#" />}
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
          items={
            data?.map((category) => ({
              title: category.name,
              url: `/category/${category.id}`,
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
