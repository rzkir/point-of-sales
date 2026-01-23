import Link from "next/link"

import { IconDotsVertical, IconPencil, IconTrash, IconBuildingStore, IconTruck, IconEye } from "@tabler/icons-react"

import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ProductActions({ product, onDelete, onViewSupplier, onViewBranch, onViewDetails }: ProductActionsProps) {
    const handleDelete = () => {
        onDelete(product)
    }

    const handleViewSupplier = () => {
        onViewSupplier(product)
    }

    const handleViewBranch = () => {
        onViewBranch(product)
    }

    const handleViewDetails = () => {
        onViewDetails(product)
    }

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
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href={`/dashboard/products/edit?id=${encodeURIComponent(String(product.id))}`}>
                            <IconPencil className="mr-2 size-4" />
                            Edit
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onSelect={(e) => {
                            e.preventDefault()
                            handleViewDetails()
                        }}
                        className="cursor-pointer"
                    >
                        <IconEye className="mr-2 size-4" />
                        View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {product.supplier_id && (
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault()
                                handleViewSupplier()
                            }}
                            className="cursor-pointer"
                        >
                            <IconTruck className="mr-2 size-4" />
                            View Supplier
                        </DropdownMenuItem>
                    )}
                    {product.branch_id && (
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault()
                                handleViewBranch()
                            }}
                            className="cursor-pointer"
                        >
                            <IconBuildingStore className="mr-2 size-4" />
                            View Branch
                        </DropdownMenuItem>
                    )}
                    {(product.supplier_id || product.branch_id) && <DropdownMenuSeparator />}
                    <DropdownMenuItem
                        variant="destructive"
                        onSelect={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        <IconTrash className="mr-2 size-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}