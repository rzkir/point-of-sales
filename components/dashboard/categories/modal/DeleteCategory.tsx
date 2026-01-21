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

interface Category {
    id: string
    uid: string
    name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

interface DeleteCategoryProps {
    category: Category
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteCategory({
    category,
    onUpdate,
    isOpen,
    onOpenChange,
}: DeleteCategoryProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/categories/${category.id}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to delete category")
            }

            toast.success("Category deleted successfully")
            onOpenChange(false)
            onUpdate()
        } catch (error) {
            console.error("Delete category error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to delete category")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Category</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &quot;{category.name}&quot;? This action cannot be undone.
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
                                <IconLoader className="mr-2 animate-spin" />
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
