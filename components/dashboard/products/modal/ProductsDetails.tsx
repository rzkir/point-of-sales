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

import type { ProductRow } from "@/lib/config"

interface ProductsDetailsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    product: ProductRow | null
}

const formatCurrency = (value?: number) => {
    const n = Number(value ?? 0)
    if (Number.isNaN(n)) return "-"
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)
}

export default function ProductsDetails({ open, onOpenChange, product }: ProductsDetailsProps) {
    const isActive = Boolean(product?.is_active)

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[640px]">
                <DialogHeader>
                    <DialogTitle>Product Details</DialogTitle>
                    <DialogDescription>Informasi lengkap produk yang dipilih.</DialogDescription>
                </DialogHeader>

                {!product ? (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">Tidak ada data produk yang dipilih.</div>
                    </div>
                ) : (
                    <div className="space-y-6 py-2">
                        <div className="flex gap-4">
                            <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted">
                                {product.image_url ? (
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
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
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold">{product.name}</h3>
                                    <Badge
                                        className={
                                            isActive
                                                ? "bg-green-500/10 text-green-700 dark:text-green-400"
                                                : "bg-red-500/10 text-red-700 dark:text-red-400"
                                        }
                                    >
                                        {isActive ? "Active" : "Inactive"}
                                    </Badge>
                                </div>
                                {product.barcode && (
                                    <div className="space-y-2">
                                        <p className="text-xs font-medium text-muted-foreground">Barcode</p>
                                        <div className="mt-2 flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-4">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Barcode Preview
                                            </p>
                                            <div className="flex items-center justify-center rounded-md bg-white p-4">
                                                <Barcode
                                                    value={product.barcode}
                                                    format="CODE128"
                                                    width={2}
                                                    height={60}
                                                    displayValue={true}
                                                    fontSize={14}
                                                    margin={10}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground break-all">{product.barcode}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">Price</div>
                                <div className="text-base font-semibold">
                                    {product.price != null ? formatCurrency(product.price) : "-"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">Cost (Modal)</div>
                                <div className="text-base">
                                    {product.modal != null ? formatCurrency(product.modal) : "-"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">Stock</div>
                                <div className="text-base">
                                    {product.stock ?? 0} {product.unit ?? ""}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">Sold</div>
                                <div className="text-base">{product.sold ?? 0}</div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Supplier
                                </div>
                                <div className="text-base">
                                    {product.supplier_name ?? product.supplier_id ?? "-"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Branch
                                </div>
                                <div className="text-base">
                                    {product.branch_name ?? product.branch_id ?? "-"}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Unit
                                </div>
                                <div className="text-base">{product.unit ?? "-"}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Min Stock
                                </div>
                                <div className="text-base">{product.min_stock ?? "-"}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Category
                                </div>
                                <div className="text-base">{product.category_id ?? "-"}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Expired
                                </div>
                                <div className="text-base">{product.expiration_date ?? "-"}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Created By
                                </div>
                                <div className="text-base">{product.created_by ?? "-"}</div>
                            </div>

                            <div className="space-y-1">
                                <div className="text-xs font-medium uppercase text-muted-foreground">
                                    Updated By
                                </div>
                                <div className="text-base">{product.updated_by ?? "-"}</div>
                            </div>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

