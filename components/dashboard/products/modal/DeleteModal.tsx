"use client"

import * as React from "react"
import { IconLoader, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { deleteProduct, type ProductRow } from "@/lib/config"

type Product = ProductRow

interface DeleteProductProps {
    product: Product
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteProduct({
    product,
    onUpdate,
    isOpen,
    onOpenChange,
}: DeleteProductProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteProduct(product.id)
            toast.success("Product deleted successfully")
            onOpenChange(false)
            onUpdate()
        } catch (error) {
            console.error("Delete product error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to delete product")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Product</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &quot;{product.name}&quot;? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <>
                                <IconLoader className="mr-2 size-4 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <IconTrash className="mr-2 size-4" />
                                Delete
                            </>
                        )}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isDeleting}>
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
