"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function BranchModal({ open, onOpenChange, branch, isLoading }: BranchModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Informasi Cabang</DialogTitle>
                    <DialogDescription>Detail cabang untuk produk ini</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">Memuat cabang...</div>
                    </div>
                ) : branch ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Nama</div>
                            <div className="text-base font-semibold">{branch.name}</div>
                        </div>
                        {branch.address && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Alamat</div>
                                <div className="text-base">{branch.address}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">Tidak ada data cabang tersedia</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
