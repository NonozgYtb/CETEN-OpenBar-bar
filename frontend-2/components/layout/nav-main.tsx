"use client"

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePanelType } from "../global-provider"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { toUrl } from "../providers/base-provider"
import { usePathname } from "next/navigation"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon | string
  }[]
}) {
  const path = usePathname()
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {/* <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-8 bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <IconCirclePlusFilled />
              <span>Quick Create</span>
            </SidebarMenuButton>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu> */}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                variant={path === item.url ? "primary" : "default"}
                size={"unsized"}
                className="grid grid-cols-[--spacing(8)_1fr] gap-2 borne:grid-cols-[--spacing(14)_1fr]"
                render={item.url ? <Link href={item.url} /> : undefined}
              >
                {item.icon &&
                  (typeof item.icon === "string" ? (
                    <img
                      src={toUrl(item.icon)}
                      alt={item.title}
                      className="mx-auto h-6 borne:h-12"
                    />
                  ) : (
                    <item.icon />
                  ))}
                <span className="borne:font-bold">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
