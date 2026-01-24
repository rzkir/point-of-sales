import React from "react";

import { AppSidebar } from "@/components/karyawan/app-sidebar";

import { SiteHeader } from "@/components/karyawan/site-header";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function KaryawanLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar />
            <SidebarInset>
                <SiteHeader />
                <main className="flex flex-1 flex-col p-4">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}