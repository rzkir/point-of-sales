import * as React from "react"

import { toast } from "sonner"

import { deleteBranch } from "@/lib/config"

export function useStateDelateBranches({
    branchId,
    onUpdate,
    onOpenChange,
}: UseDeleteBranchProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteBranch(branchId)
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

    return {
        isDeleting,
        handleDelete,
    }
}
