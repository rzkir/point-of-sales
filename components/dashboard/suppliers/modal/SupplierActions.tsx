import * as React from "react"

import { IconDotsVertical, IconTrash } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { SupplierEditForm } from "@/components/dashboard/suppliers/modal/ModalSuppliers"

import { DeleteSupplier } from "@/components/dashboard/suppliers/modal/DelateSuppliers"

export function SupplierActions({ supplier, onUpdate }: { supplier: SupplierRow; onUpdate: () => void }) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="data-[state=open]:bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 flex size-9 transition-colors"
                        size="icon"
                    >
                        <IconDotsVertical className="size-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                    <SupplierEditForm supplier={supplier} onUpdate={onUpdate}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            Edit
                        </DropdownMenuItem>
                    </SupplierEditForm>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                            e.preventDefault()
                            setIsDeleteDialogOpen(true)
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        <IconTrash className="mr-2 size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteSupplier
                supplier={supplier}
                onUpdate={onUpdate}
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </>
    )
}
