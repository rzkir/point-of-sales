"use client"

import Image from "next/image"

import Barcode from "react-barcode"

import { Badge } from "@/components/ui/badge"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { formatDate, formatDateTime } from "@/lib/format-date"

import { formatCurrency } from "@/lib/format-idr"

export default function ProductsDetails({
    open,
    onOpenChange,
    product,
    supplierName,
    branchName,
    categoryName,
}: ProductsDetailsProps) {
    const isActive = Boolean(product?.is_active)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b border-border/60 pb-4">
                    <DialogTitle className="text-lg font-semibold tracking-tight">
                        Product Details
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Informasi lengkap produk yang dipilih.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 pr-1">
                    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
                        {/* Left: main product info */}
                        <div className="space-y-4">
                            <div className="flex gap-4 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
                                <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                    {product?.image_url ? (
                                        <Image
                                            src={product?.image_url}
                                            alt={product?.name}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                    ) : (
                                        <span className="text-xs text-muted-foreground px-2 text-center">
                                            No image
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-wrap items-center gap-2 justify-between">
                                        <div>
                                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                                                Nama Produk
                                            </p>
                                            <h3 className="mt-1 text-lg font-semibold leading-tight">
                                                {product?.name || "-"}
                                            </h3>
                                        </div>
                                        <Badge
                                            className={
                                                (isActive
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
                                                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/40") +
                                                " rounded-full px-3 py-1 text-[11px] font-medium"
                                            }
                                        >
                                            {isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Price
                                            </div>
                                            <div className="text-base font-semibold">
                                                {product?.price != null ? formatCurrency(product?.price) : "-"}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Cost (Modal)
                                            </div>
                                            <div className="text-base">
                                                {product?.modal != null ? formatCurrency(product?.modal) : "-"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-dashed border-border/60 mt-1">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Stock
                                            </p>
                                            <p className="text-sm">
                                                {product?.stock ?? 0} {product?.unit ?? ""}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Sold
                                            </p>
                                            <p className="text-sm">{product?.sold ?? 0}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <div>
                                        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                            Barcode
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Gunakan barcode ini untuk scanning di kasir.
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/40 p-4">
                                    <div className="flex items-center justify-center rounded-md bg-background px-4 py-3 shadow-sm">
                                        <Barcode
                                            value={product?.barcode ?? ""}
                                            format="CODE128"
                                            width={2}
                                            height={60}
                                            displayValue={true}
                                            fontSize={14}
                                            margin={10}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground break-all">
                                        {product?.barcode || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: meta & relational info */}
                        <div className="space-y-4">
                            <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">
                                    Info Relasi
                                </p>
                                <div className="grid gap-3">
                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Supplier
                                        </div>
                                        <div className="text-sm">
                                            {product?.supplier_id ? supplierName ?? "Loading..." : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Branch
                                        </div>
                                        <div className="text-sm">
                                            {product?.branch_id ? branchName ?? "Loading..." : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Category
                                        </div>
                                        <div className="text-sm">
                                            {product?.category_id ? categoryName ?? "Loading..." : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Unit
                                        </div>
                                        <div className="text-sm">{product?.unit ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Min Stock
                                        </div>
                                        <div className="text-sm">{product?.min_stock ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Expired
                                        </div>
                                        <div className="text-sm">
                                            {product?.expiration_date ? formatDate(product?.expiration_date) : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">
                                    Audit Trail
                                </p>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Created By
                                        </div>
                                        <div className="text-sm">{product?.created_by ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Updated By
                                        </div>
                                        <div className="text-sm">{product?.updated_by ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Created At
                                        </div>
                                        <div className="text-sm">
                                            {product?.created_at ? formatDateTime(product?.created_at) : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Updated At
                                        </div>
                                        <div className="text-sm">
                                            {product?.updated_at ? formatDateTime(product?.updated_at) : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

