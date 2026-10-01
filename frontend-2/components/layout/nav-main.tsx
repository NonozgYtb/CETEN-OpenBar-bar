"use client"

import { type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuButtonVariants,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { toUrl } from "../providers/base-provider"
import { usePathname } from "next/navigation"
import { Route } from "next"
import { cn } from "@/lib/utils"

export function NavMain({
  items,
  imageSidebar = false,
  className,
  forceVariant,
}: {
  items: ({
    title: string
    icon?: Icon | string
  } & ({ url: Route } | { onClick: () => void }))[]
  imageSidebar?: boolean
  className?: string
  forceVariant?: SidebarMenuButtonVariants["variant"]
}) {
  const path = usePathname()
  return (
    <SidebarGroup className={className}>
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
                variant={
                  forceVariant ??
                  ("url" in item && path === item.url ? "primary" : "default")
                }
                size={"unsized"}
                className={cn(
                  "grid gap-2",
                  imageSidebar
                    ? "grid-cols-[--spacing(8)_1fr] borne:grid-cols-[--spacing(14)_1fr]"
                    : "grid-cols-[auto_1fr] borne:px-4 borne:py-4"
                )}
                render={
                  "url" in item && item.url ? (
                    <Link href={item.url as Route} prefetch={false} />
                  ) : "onClick" in item ? (
                    <button onClick={item.onClick} />
                  ) : undefined
                }
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
