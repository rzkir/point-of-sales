"use client"

import { IconReceipt, IconPackage } from "@tabler/icons-react"

import { type ColumnDef } from "@tanstack/react-table"

import { Button } from "@/components/ui/button"

import { formatCurrency } from "@/lib/format-idr"

import { formatDateTime } from "@/lib/format-date"

export const createColumns = (onViewItems?: (transaction: TransactionRow) => void): ColumnDef<TransactionRow>[] => [
    {
        accessorKey: "transaction_number",
        header: () => <span className="font-semibold">Nomor Transaksi</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconReceipt className="size-5" />
                </div>
                <div className="min-w-0">
                    <div className="font-semibold text-foreground truncate">{row.getValue("transaction_number")}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "customer_name",
        header: () => <span className="font-semibold">Nama Pelanggan</span>,
        cell: ({ row }) => (
            <span className="text-sm text-foreground">{row.original.customer_name || "Pelanggan Langsung"}</span>
        ),
    },
    {
        accessorKey: "total",
        header: () => <span className="font-semibold">Total</span>,
        cell: ({ row }) => <span className="text-sm font-medium text-foreground">{formatCurrency(row.getValue("total"))}</span>,
    },
    {
        accessorKey: "paid_amount",
        header: () => <span className="font-semibold">Dibayar</span>,
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatCurrency(row.getValue("paid_amount"))}</span>,
    },
    {
        accessorKey: "due_amount",
        header: () => <span className="font-semibold">Hutang</span>,
        cell: ({ row }) => {
            const due = Number(row.getValue("due_amount") || 0)
            return (
                <span className={`text-sm font-medium ${due > 0 ? "text-orange-600 dark:text-orange-400" : "text-muted-foreground"}`}>
                    {formatCurrency(due)}
                </span>
            )
        },
    },
    {
        accessorKey: "branch_name",
        header: () => <span className="font-semibold">Branch</span>,
        cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.getValue("branch_name") || "-"}</span>,
    },
    {
        accessorKey: "created_at",
        header: () => <span className="font-semibold">Dibuat Pada</span>,
        cell: ({ row }) => (
            <span className="text-sm text-muted-foreground">{formatDateTime(row.getValue("created_at"))}</span>
        ),
    },
    {
        id: "actions",
        header: () => <span className="font-semibold">Aksi</span>,
        cell: ({ row }) => {
            const transaction = row.original
            return (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewItems?.(transaction)}
                    className="gap-2"
                >
                    <IconPackage className="size-4" />
                    Lihat Item
                </Button>
            )
        },
    },
]
