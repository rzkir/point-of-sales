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
                    <DialogTitle>Branch Information</DialogTitle>
                    <DialogDescription>Details of the branch for this product</DialogDescription>
                </DialogHeader>
                {isLoading ? (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">Loading branch...</div>
                    </div>
                ) : branch ? (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-muted-foreground">Name</div>
                            <div className="text-base font-semibold">{branch.name}</div>
                        </div>
                        {branch.address && (
                            <div className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground">Address</div>
                                <div className="text-base">{branch.address}</div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="py-8 text-center">
                        <div className="text-sm text-muted-foreground">No branch data available</div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
