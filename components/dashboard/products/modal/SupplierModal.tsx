"use client"

import { Badge } from "@/components/ui/badge"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function SupplierModal({ open, onOpenChange, supplier, isLoading }: SupplierModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Informasi Pemasok</DialogTitle>
                    <DialogDescription>Detail pemasok untuk produk ini</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">Memuat pemasok...</div>
                    </div>
                ) : supplier ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Nama</div>
                            <div className="text-base font-semibold">{supplier.name}</div>
                        </div>
                        {supplier.contact_person && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Kontak Person</div>
                                <div className="text-base">{supplier.contact_person}</div>
                            </div>
                        )}
                        {supplier.phone && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Telepon</div>
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
                                <div className="text-sm font-medium text-muted-foreground">Alamat</div>
                                <div className="text-base">{supplier.address}</div>
                            </div>
                        )}
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Status</div>
                            <Badge className={supplier.is_active ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}>
                                {supplier.is_active ? "Aktif" : "Tidak Aktif"}
                            </Badge>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">Tidak ada data pemasok tersedia</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
