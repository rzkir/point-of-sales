"use client"

import Image from "next/image"

import { IconPackage } from "@tabler/icons-react"

import {
    type ColumnDef,
} from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"

import { type ProductRow } from "@/lib/config"

import { ProductActions } from "@/components/dashboard/products/modal/ProductActions"

const formatCurrency = (value?: number) => {
    const n = Number(value ?? 0)
    if (Number.isNaN(n)) return "-"
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)
}

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
            header: () => <span className="font-semibold">Name</span>,
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    {row.original.image_url ? (
                        <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
                            <Image
                                src={row.original.image_url}
                                alt={row.getValue("name") as string}
                                fill
                                className="object-cover"
                                sizes="48px"
                            />
                        </div>
                    ) : (
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <IconPackage className="size-6" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <div className="font-semibold text-foreground truncate">{row.getValue("name")}</div>
                        <div className="text-xs text-muted-foreground truncate">
                            {row.original.barcode ? `Barcode: ${row.original.barcode}` : "No barcode"}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            accessorKey: "price",
            header: () => <span className="font-semibold">Price</span>,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatCurrency(row.getValue("price"))}</span>,
        },
        {
            accessorKey: "stock",
            header: () => <span className="font-semibold">Stock</span>,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{String(row.getValue("stock") ?? 0)}</span>,
        },
        {
            accessorKey: "sold",
            header: () => <span className="font-semibold">Sold</span>,
            cell: ({ row }) => <span className="text-sm text-muted-foreground">{String(row.getValue("sold") ?? 0)}</span>,
        },
        {
            accessorKey: "is_active",
            header: () => <span className="font-semibold">Status</span>,
            cell: ({ row }) => {
                const isActive = Boolean(row.getValue("is_active"))
                return (
                    <Badge className={isActive ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}>
                        {isActive ? "Active" : "Inactive"}
                    </Badge>
                )
            },
        },
        {
            id: "actions",
            header: () => <span className="font-semibold">Actions</span>,
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