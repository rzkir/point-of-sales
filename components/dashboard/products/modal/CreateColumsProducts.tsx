"use client"

import Image from "next/image"

import { IconPackage } from "@tabler/icons-react"

import {
    type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"

import { ProductActions } from "@/components/dashboard/products/modal/ProductActions"

import { formatCurrency, formatNumber } from "@/lib/format-idr"

export const createColumns = ({
    onDelete,
    onViewSupplier,
    onViewBranch,
    onViewDetails,
}: {
    onDelete: (product: ProductRow) => void
    onViewSupplier: (product: ProductRow) => void
    onViewBranch: (product: ProductRow) => void
    onViewDetails: (product: ProductRow) => void
}): ColumnDef<ProductRow>[] => [
        {
            accessorKey: "name",
            header: () => <span className="font-semibold">Nama</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    {row.original.image_url ? (
                        <div className="relative flex size-10 sm:size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                            <Image
                                src={row.original.image_url}
                                alt={row.getValue("name") as string}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 40px, 48px"
                            />
                        </div>
                    ) : (
                        <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <IconPackage className="size-5 sm:size-6" />
                        </div>
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm sm:text-base text-foreground truncate">{row.getValue("name")}</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {row.original.barcode ? `Barcode: ${row.original.barcode}` : "Tidak ada barcode"}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "supplier_name",
            header: () => <span className="font-semibold">Pemasok</span>,
            cell: ({ row }) => {
                const value = row.getValue("supplier_name") as string | null | undefined
                return <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">{value || "—"}</span>
            },
        },
        {
            accessorKey: "branch_name",
            header: () => <span className="font-semibold">Cabang</span>,
            cell: ({ row }) => {
                const value = row.getValue("branch_name") as string | null | undefined
                return <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">{value || "—"}</span>
            },
        },
        {
            accessorKey: "category_name",
            header: () => <span className="font-semibold">Kategori</span>,
            cell: ({ row }) => {
                const value = row.getValue("category_name") as string | null | undefined
                return <span className="text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">{value || "—"}</span>
            },
        },
        {
            accessorKey: "price",
            header: () => <span className="font-semibold">Harga</span>,
            cell: ({ row }) => <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{formatCurrency(row.getValue("price"))}</span>,
        },
        {
            accessorKey: "stock",
            header: () => <span className="font-semibold">Stok</span>,
            cell: ({ row }) => <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{formatNumber(row.getValue("stock") ?? 0)}</span>,
        },
        {
            accessorKey: "sold",
            header: () => <span className="font-semibold">Terjual</span>,
            cell: ({ row }) => <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">{formatNumber(row.getValue("sold") ?? 0)}</span>,
        },
        {
            accessorKey: "is_active",
            header: () => <span className="font-semibold">Status</span>,
            filterFn: (row, _columnId, filterValue: string) => {
                if (!filterValue || filterValue === "all") return true
                const isActive = Boolean(row.getValue("is_active"))
                if (filterValue === "active") return isActive
                if (filterValue === "inactive") return !isActive
                return true
            },
            cell: ({ row }) => {
                const isActive = Boolean(row.getValue("is_active"))
                return (
                    <Badge className={isActive ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}>
                        {isActive ? "Aktif" : "Tidak Aktif"}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: () => <span className="font-semibold">Aksi</span>,
            cell: ({ row }) => (
                <ProductActions
                    product={row.original}
                    onDelete={onDelete}
                    onViewSupplier={onViewSupplier}
                    onViewBranch={onViewBranch}
                    onViewDetails={onViewDetails}
                />
            ),
        },
    ]