import * as React from "react"

import { toast } from "sonner"

import { deleteCategory } from "@/lib/config"

export function useStateDelateCategories({
    categoryId,
    onUpdate,
    onOpenChange,
}: UseDeleteCategoryProps) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteCategory(categoryId)
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

    return {
        isDeleting,
        handleDelete,
    }
}
