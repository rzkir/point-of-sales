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

interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

interface DeleteBranchProps {
    branch: Branch
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteBranch({
    branch,
    onUpdate,
    isOpen,
    onOpenChange,
}: DeleteBranchProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const response = await fetch(`/api/branches/${branch.id}`, {
                method: "DELETE",
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to delete branch")
            }

            toast.success("Branch deleted successfully")
            onOpenChange(false)
            onUpdate()
        } catch (error) {
            console.error("Delete error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to delete branch")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Branch</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &quot;{branch.name}&quot;? This action cannot be undone.
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
