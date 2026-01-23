"use client"

import * as React from "react"
import { toast } from "sonner"

import { deleteEmployee } from "@/lib/config"

export function useStateDelateEmployee(employee: Employee, onUpdate: () => void, onOpenChange: (open: boolean) => void) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteEmployee(employee.id)
            toast.success("Employee deleted successfully")
            onOpenChange(false)
            onUpdate()
        } catch (error) {
            console.error("Delete error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to delete employee")
        } finally {
            setIsDeleting(false)
        }
    }

    return {
        isDeleting,
        handleDelete,
    }
}