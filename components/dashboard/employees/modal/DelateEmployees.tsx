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
import { deleteEmployee, type EmployeeRow } from "@/lib/config"

type Employee = EmployeeRow

interface DeleteEmployeeProps {
    employee: Employee
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function DeleteEmployee({
    employee,
    onUpdate,
    isOpen,
    onOpenChange,
}: DeleteEmployeeProps) {
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

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete Employee</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete &quot;{employee.name}&quot;? This action cannot be undone.
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
