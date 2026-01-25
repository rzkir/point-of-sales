"use client"

import { IconReceipt } from "@tabler/icons-react"

import { type ColumnDef } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"

import { formatCurrency } from "@/lib/format-idr"

import { formatDateTime } from "@/lib/format-date"

export const createColumns = (): ColumnDef<TransactionRow>[] => [
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
                    <div className="text-xs text-muted-foreground truncate">
                        {row.original.customer_name || "Pelanggan Langsung"}
                    </div>
                </div>
            </div>
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
        accessorKey: "payment_status",
        header: () => <span className="font-semibold">Status Pembayaran</span>,
        cell: ({ row }) => {
            const status = row.getValue("payment_status") as string
            const statusConfig = {
                paid: { label: "Lunas", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
                unpaid: { label: "Belum Lunas", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
                partial: { label: "Sebagian", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
            }
            const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unpaid
            return <Badge className={config.className}>{config.label}</Badge>
        },
    },
    {
        accessorKey: "status",
        header: () => <span className="font-semibold">Status</span>,
        cell: ({ row }) => {
            const status = row.getValue("status") as string
            const statusConfig = {
                completed: { label: "Selesai", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
                pending: { label: "Menunggu", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
                cancelled: { label: "Dibatalkan", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
                return: { label: "Retur", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
            }
            const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
            return <Badge className={config.className}>{config.label}</Badge>
        },
    },
    {
        accessorKey: "is_credit",
        header: () => <span className="font-semibold">Type</span>,
        cell: ({ row }) => {
            const isCredit = Boolean(row.getValue("is_credit"))
            return (
                <Badge className={isCredit ? "bg-blue-500/10 text-blue-700 dark:text-blue-400" : "bg-gray-500/10 text-gray-700 dark:text-gray-400"}>
                    {isCredit ? "Kredit" : "Tunai"}
                </Badge>
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
]
