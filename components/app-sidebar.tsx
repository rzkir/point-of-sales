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
  IconCreditCard,
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
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Produk",
      url: "/dashboard/products",
      icon: IconBox,
    },
    {
      title: "Kategori",
      url: "/dashboard/categories",
      icon: IconCategory,
    },
    {
      title: "Cabang",
      url: "/dashboard/branches",
      icon: IconBuilding,
    },
    {
      title: "Karyawan",
      url: "/dashboard/employees",
      icon: IconUsers,
    },
    {
      title: "Supplier",
      url: "/dashboard/suppliers",
      icon: IconBuildingStore,
    },
  ],
  navSecondary: [
    {
      title: "Bantuan",
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
      name: "Transaksi",
      url: "/dashboard/transactions",
      icon: IconCreditCardFilled,
    },
    {
      name: "Hutang",
      url: "/dashboard/partial",
      icon: IconCreditCard,
    },
    {
      name: "Rekap",
      url: "/dashboard/rekapitusi",
      icon: IconFileWord,
    },
    {
      name: "Laporan",
      url: "/dashboard/reports",
      icon: IconReport,
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
              <Link href="/dashboard">
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
