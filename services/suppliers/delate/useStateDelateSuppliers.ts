"use client"

import * as React from "react"

import { toast } from "sonner"

import { deleteSupplier } from "@/lib/config"

export function useStateDelateSuppliers(
    supplier: SupplierRow,
    onUpdate: () => void,
    onOpenChange: (open: boolean) => void,
) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteSupplier(supplier.id)
            toast.success("Supplier deleted successfully")
            onOpenChange(false)
            onUpdate()
        } catch (error) {
            console.error("Delete error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to delete supplier")
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        isDeleting,
        handleDelete,
    }
}