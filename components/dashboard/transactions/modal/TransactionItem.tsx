"use client"

import { IconPackage, IconReceipt } from "@tabler/icons-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { formatCurrency } from "@/lib/format-idr"

import { formatDateTime } from "@/lib/format-date"

import { Badge } from "@/components/ui/badge"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TransactionItemProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    transaction: TransactionRow | null
}

export default function TransactionItem({ open, onOpenChange, transaction }: TransactionItemProps) {
    if (!transaction) return null

    // Parse items from JSON string or use products array
    let items: Array<{
        product_id?: string | number
        product_name: string
        quantity: number
        price: number
        subtotal?: number
        unit?: string
    }> = []

    if ((transaction as TransactionRow).items) {
        try {
            const itemsString = (transaction as TransactionRow).items
            if (typeof itemsString === 'string') {
                items = JSON.parse(itemsString)
            } else if (Array.isArray(itemsString)) {
                items = itemsString
            }
        } catch (error) {
            console.error('Failed to parse items:', error)
            items = []
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <IconReceipt className="size-5" />
                        Item Transaksi - {transaction.transaction_number}
                    </DialogTitle>
                    <DialogDescription>
                        Detail produk yang dibeli dalam transaksi ini
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Transaction Info */}
                    <div className="grid gap-4 rounded-lg border bg-muted/30 p-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Pelanggan</div>
                                <div className="text-sm font-semibold">{transaction.customer_name || "Pelanggan Langsung"}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Cabang</div>
                                <div className="text-sm font-semibold">{transaction.branch_name || "-"}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Kasir</div>
                                <div className="text-sm font-semibold">{transaction.created_by || "-"}</div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Status</div>
                                <div>
                                    {(() => {
                                        const status = transaction.status
                                        const statusConfig = {
                                            completed: { label: "Selesai", className: "bg-green-500/10 text-green-700 dark:text-green-400" },
                                            pending: { label: "Menunggu", className: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400" },
                                            cancelled: { label: "Dibatalkan", className: "bg-red-500/10 text-red-700 dark:text-red-400" },
                                            return: { label: "Retur", className: "bg-orange-500/10 text-orange-700 dark:text-orange-400" },
                                        }
                                        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
                                        return <Badge className={config.className}>{config.label}</Badge>
                                    })()}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-medium text-muted-foreground">Tanggal</div>
                                <div className="text-sm font-semibold">{formatDateTime(transaction.created_at)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold">Daftar Produk</h3>
                        {items.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {items.map((item, index) => {
                                    const subtotal = item.subtotal ?? (item.quantity * item.price)
                                    return (
                                        <Card key={item.product_id || `item-${index}`}>
                                            <CardHeader className="pb-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                                                        {index + 1}
                                                    </div>
                                                    <CardTitle className="text-sm flex items-center gap-2">
                                                        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                            <IconPackage className="size-4" />
                                                        </div>
                                                        <span className="truncate">{item.product_name}</span>
                                                    </CardTitle>
                                                </div>
                                                {item.unit && (
                                                    <div className="text-xs text-muted-foreground pl-10">{item.unit}</div>
                                                )}
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-muted-foreground">Qty</div>
                                                        <div className="font-medium">{item.quantity}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-muted-foreground">Harga</div>
                                                        <div className="text-xs">{formatCurrency(item.price)}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="text-xs text-muted-foreground">Subtotal</div>
                                                        <div className="font-semibold">{formatCurrency(subtotal)}</div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8">
                                <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                                    <IconPackage className="size-6 text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <h4 className="font-semibold">Tidak ada item</h4>
                                    <p className="text-sm text-muted-foreground">Transaksi ini tidak memiliki produk</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Summary */}
                    {items.length > 0 && (
                        <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">{formatCurrency(transaction.subtotal || 0)}</span>
                            </div>
                            {transaction.discount > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Diskon</span>
                                    <span className="font-medium text-red-600 dark:text-red-400">
                                        -{formatCurrency(transaction.discount || 0)}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center justify-between border-t pt-2 text-base font-semibold">
                                <span>Total</span>
                                <span>{formatCurrency(transaction.total || 0)}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-muted-foreground">Dibayar</span>
                                <span className="font-medium text-green-600 dark:text-green-400">
                                    {formatCurrency(transaction.paid_amount || 0)}
                                </span>
                            </div>
                            {transaction.due_amount > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Sisa Hutang</span>
                                    <span className="font-medium text-orange-600 dark:text-orange-400">
                                        {formatCurrency(transaction.due_amount || 0)}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
