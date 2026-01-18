"use client"

import * as React from "react"
import { IconBuilding, IconDotsVertical, IconLoader, IconPlus, IconTrash } from "@tabler/icons-react"
import { toast } from "sonner"
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type ColumnFiltersState,
    type SortingState,
} from "@tanstack/react-table"

import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

// Create columns function that accepts onUpdate callback
const createColumns = (onUpdate: () => void): ColumnDef<Branch>[] => [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="font-medium">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => (
            <div className="text-muted-foreground">{row.getValue("address") || "-"}</div>
        ),
    },
    {
        accessorKey: "createdAt",
        header: "Created At",
        cell: ({ row }) => {
            const dateStr = row.getValue("createdAt") as string
            if (!dateStr) return <div className="text-sm">-</div>

            try {
                const date = new Date(dateStr)
                // Use consistent format to avoid hydration mismatch
                const formatted = date.toISOString().split('T')[0] // YYYY-MM-DD format
                return <div className="text-sm">{formatted}</div>
            } catch {
                return <div className="text-sm">{dateStr}</div>
            }
        },
    },
    {
        id: "actions",
        cell: ({ row }) => <BranchActions branch={row.original} onUpdate={onUpdate} />,
    },
]

function BranchActions({ branch, onUpdate }: { branch: Branch; onUpdate: () => void }) {
    const [isDeleting, setIsDeleting] = React.useState(false)

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${branch.name}"?`)) {
            return
        }

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
            onUpdate()
        } catch (error) {
            console.error("Delete error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to delete branch")
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                    size="icon"
                    disabled={isDeleting}
                >
                    {isDeleting ? (
                        <IconLoader className="animate-spin" />
                    ) : (
                        <IconDotsVertical />
                    )}
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
                <BranchEditForm branch={branch} onUpdate={onUpdate}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        Edit
                    </DropdownMenuItem>
                </BranchEditForm>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <IconTrash className="mr-2 size-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function BranchEditForm({
    branch,
    onUpdate,
    children,
}: {
    branch: Branch
    onUpdate: () => void
    children: React.ReactElement
}) {
    const isMobile = useIsMobile()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const address = formData.get("address") as string

        try {
            const response = await fetch(`/api/branches/${branch.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, address }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to update branch")
            }

            toast.success("Branch updated successfully")
            setIsOpen(false)
            onUpdate()
        } catch (error) {
            console.error("Update error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update branch")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Drawer direction={isMobile ? "bottom" : "right"} open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild onClick={() => setIsOpen(true)}>
                {children}
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>Edit Branch</DrawerTitle>
                    <DrawerDescription>
                        Update branch information
                    </DrawerDescription>
                </DrawerHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                            <Input
                                id="edit-name"
                                name="name"
                                defaultValue={branch.name}
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-address">Address</FieldLabel>
                            <Input
                                id="edit-address"
                                name="address"
                                defaultValue={branch.address}
                                disabled={isSubmitting}
                            />
                        </Field>
                    </FieldGroup>
                </form>
                <DrawerFooter>
                    <Button
                        onClick={() => formRef.current?.requestSubmit()}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <IconLoader className="mr-2 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update Branch"
                        )}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

function BranchCreateForm({ onUpdate }: { onUpdate: () => void }) {
    const isMobile = useIsMobile()
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const address = formData.get("address") as string

        try {
            const response = await fetch("/api/branches", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, address }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to create branch")
            }

            toast.success("Branch created successfully")
            setIsOpen(false)
            formRef.current?.reset()
            onUpdate()
        } catch (error) {
            console.error("Create error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create branch")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Drawer direction={isMobile ? "bottom" : "right"} open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild onClick={() => setIsOpen(true)}>
                <Button variant="outline" size="sm">
                    <IconPlus className="mr-2" />
                    <span className="hidden lg:inline">Add Branch</span>
                    <span className="lg:hidden">Add</span>
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader className="gap-1">
                    <DrawerTitle>Create New Branch</DrawerTitle>
                    <DrawerDescription>
                        Add a new branch to the system
                    </DrawerDescription>
                </DrawerHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto px-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="create-name">Name</FieldLabel>
                            <Input
                                id="create-name"
                                name="name"
                                placeholder="Enter branch name"
                                required
                                disabled={isSubmitting}
                            />
                            <FieldDescription>
                                Branch name is required and must be unique
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-address">Address</FieldLabel>
                            <Input
                                id="create-address"
                                name="address"
                                placeholder="Enter branch address"
                                disabled={isSubmitting}
                            />
                        </Field>
                    </FieldGroup>
                </form>
                <DrawerFooter>
                    <Button
                        onClick={() => formRef.current?.requestSubmit()}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <IconLoader className="mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Branch"
                        )}
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    )
}

export default function Branches() {
    const [branches, setBranches] = React.useState<Branch[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const fetchBranches = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const response = await fetch("/api/branches")
            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to fetch branches")
            }

            setBranches(data.data || [])
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to fetch branches")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchBranches()
    }, [fetchBranches])

    const columns = React.useMemo(() => createColumns(fetchBranches), [fetchBranches])

    const table = useReactTable({
        data: branches,
        columns,
        state: {
            sorting,
            columnFilters,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <IconLoader className="animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading branches...</span>
            </div>
        )
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <IconBuilding className="size-5" />
                    <h1 className="text-2xl font-bold">Branches</h1>
                </div>
                <BranchCreateForm onUpdate={fetchBranches} />
            </div>

            <div className="overflow-hidden rounded-lg border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="h-24 text-center"
                                >
                                    No branches found. Create your first branch!
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {branches.length > 0 && (
                <div className="text-muted-foreground text-sm">
                    Showing {table.getRowModel().rows.length} of {branches.length} branch(es)
                </div>
            )}
        </div>
    )
}
