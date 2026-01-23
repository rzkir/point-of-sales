"use client"

import { Badge } from "@/components/ui/badge"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import type { SupplierRow } from "@/lib/config"

interface SupplierModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    supplier: SupplierRow | null
    isLoading: boolean
}

export default function SupplierModal({ open, onOpenChange, supplier, isLoading }: SupplierModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Supplier Information</DialogTitle>
                    <DialogDescription>Details of the supplier for this product</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">Loading supplier...</div>
                    </div>
                ) : supplier ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Name</div>
                            <div className="text-base font-semibold">{supplier.name}</div>
                        </div>
                        {supplier.contact_person && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Contact Person</div>
                                <div className="text-base">{supplier.contact_person}</div>
                            </div>
                        )}
                        {supplier.phone && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Phone</div>
                                <div className="text-base">{supplier.phone}</div>
                            </div>
                        )}
                        {supplier.email && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Email</div>
                                <div className="text-base">{supplier.email}</div>
                            </div>
                        )}
                        {supplier.address && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Address</div>
                                <div className="text-base">{supplier.address}</div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                            <Badge className={supplier.is_active ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}>
                                {supplier.is_active ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">No supplier data available</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
