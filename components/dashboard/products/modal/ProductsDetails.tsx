"use client"

import { useState, useEffect } from "react"

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
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 640)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
                <DialogHeader className="border-b border-border/60 pb-3 sm:pb-4">
                    <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
                        Product Details
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground">
                        Informasi lengkap produk yang dipilih.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto py-4 pr-1">
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
                        {/* Left: main product info */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 rounded-xl border border-border/60 bg-card/80 p-3 sm:p-4 shadow-sm">
                                <div className="relative flex size-20 sm:size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted mx-auto sm:mx-0">
                                    {product?.image_url ? (
                                        <Image
                                            src={product?.image_url}
                                            alt={product?.name}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 640px) 80px, 96px"
                                        />
                                    ) : (
                                        <span className="text-xs text-muted-foreground px-2 text-center">
                                            No image
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                                                Nama Produk
                                            </p>
                                            <h3 className="mt-1 text-base sm:text-lg font-semibold leading-tight wrap-break-word">
                                                {product?.name || "-"}
                                            </h3>
                                        </div>
                                        <Badge
                                            className={
                                                (isActive
                                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/40"
                                                    : "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/40") +
                                                " rounded-full px-3 py-1 text-[11px] font-medium w-fit"
                                            }
                                        >
                                            {isActive ? "Active" : "Inactive"}
                                        </Badge>
                                    </div>

                                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Price
                                            </div>
                                            <div className="text-sm sm:text-base font-semibold wrap-break-word">
                                                {product?.price != null ? formatCurrency(product?.price) : "-"}
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Cost (Modal)
                                            </div>
                                            <div className="text-sm sm:text-base wrap-break-word">
                                                {product?.modal != null ? formatCurrency(product?.modal) : "-"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 pt-2 border-t border-dashed border-border/60 mt-1">
                                        <div className="space-y-1">
                                            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                                Stock
                                            </p>
                                            <p className="text-sm wrap-break-word">
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

                            <div className="rounded-xl border border-border/60 bg-card/80 p-3 sm:p-4 shadow-sm">
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
                                <div className="mt-2 flex flex-col items-center gap-2 rounded-lg border border-dashed border-border/60 bg-muted/40 p-2 sm:p-4">
                                    <div className="flex items-center justify-center rounded-md bg-background px-2 sm:px-4 py-2 sm:py-3 shadow-sm w-full overflow-x-auto">
                                        <Barcode
                                            value={product?.barcode ?? ""}
                                            format="CODE128"
                                            width={isMobile ? 1.5 : 2}
                                            height={isMobile ? 45 : 60}
                                            displayValue={true}
                                            fontSize={isMobile ? 12 : 14}
                                            margin={isMobile ? 8 : 10}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground break-all text-center px-2 max-w-full">
                                        {product?.barcode || "-"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: meta & relational info */}
                        <div className="space-y-4">
                            <div className="rounded-xl border border-border/60 bg-card/80 p-3 sm:p-4 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">
                                    Info Relasi
                                </p>
                                <div className="grid gap-3">
                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Supplier
                                        </div>
                                        <div className="text-sm wrap-break-word">
                                            {product?.supplier_id ? supplierName ?? "Loading..." : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Branch
                                        </div>
                                        <div className="text-sm wrap-break-word">
                                            {product?.branch_id ? branchName ?? "Loading..." : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Category
                                        </div>
                                        <div className="text-sm wrap-break-word">
                                            {product?.category_id ? categoryName ?? "Loading..." : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Unit
                                        </div>
                                        <div className="text-sm wrap-break-word">{product?.unit ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Min Stock
                                        </div>
                                        <div className="text-sm wrap-break-word">{product?.min_stock ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Expired
                                        </div>
                                        <div className="text-sm wrap-break-word">
                                            {product?.expiration_date ? formatDate(product?.expiration_date) : "-"}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-card/80 p-3 sm:p-4 shadow-sm">
                                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground mb-3">
                                    Audit Trail
                                </p>
                                <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Created By
                                        </div>
                                        <div className="text-sm wrap-break-word">{product?.created_by ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Updated By
                                        </div>
                                        <div className="text-sm wrap-break-word">{product?.updated_by ?? "-"}</div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Created At
                                        </div>
                                        <div className="text-sm wrap-break-word">
                                            {product?.created_at ? formatDateTime(product?.created_at) : "-"}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                            Updated At
                                        </div>
                                        <div className="text-sm wrap-break-word">
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

