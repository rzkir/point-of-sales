"use client"

import * as React from "react"

import {
  IconDashboard,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconCreditCardFilled,
  IconBox,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"

import { NavMain } from "@/components/nav-main"

import { NavSecondary } from "@/components/nav-secondary"

import { NavUser } from "@/components/nav-user"

import Link from "next/link"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Karyawan",
      url: "/karyawan",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/karyawan/products",
      icon: IconBox,
    },
  ],
  navSecondary: [
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Transactions",
      url: "karyawan/transactions",
      icon: IconCreditCardFilled,
    },
    {
      name: "Reports",
      url: "/karyawan/reports",
      icon: IconReport,
    },
    {
      name: "Rekapitusi",
      url: "/karyawan/rekapitusi",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="/karyawan">
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Langgeng Jaya</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
