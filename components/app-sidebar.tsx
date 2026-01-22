"use client"

import * as React from "react"

import {
  IconBuilding,
  IconDashboard,
  IconFileWord,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconUsers,
  IconCreditCardFilled,
  IconBox,
  IconBuildingStore,
  IconCategory,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"

import { NavMain } from "@/components/nav-main"

import { NavSecondary } from "@/components/nav-secondary"

import { NavUser } from "@/components/nav-user"

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
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/dashboard/products",
      icon: IconBox,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: IconCategory,
    },
    {
      title: "Branches",
      url: "/dashboard/branches",
      icon: IconBuilding,
    },
    {
      title: "Employees",
      url: "/dashboard/employees",
      icon: IconUsers,
    },
    {
      title: "Suppliers",
      url: "/dashboard/suppliers",
      icon: IconBuildingStore,
    },
  ],
  navSecondary: [
    {
      title: "Transactions",
      url: "/dashboard/transactions",
      icon: IconCreditCardFilled,
    },
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
      url: "dashboard/transactions",
      icon: IconCreditCardFilled,
    },
    {
      name: "Reports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Rekapitusi",
      url: "/dashboard/rekapitusi",
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
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Langgeng Jaya</span>
              </a>
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
