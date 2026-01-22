"use client"

import * as React from "react"
import { IconBuilding, IconDotsVertical, IconTrash, IconMapPin, IconCalendar } from "@tabler/icons-react"
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

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { BranchEditForm, BranchCreateForm } from "./modal/ModalBranch"
import { DeleteBranch } from "./modal/DelateBranch"
import { AppSkeleton, CardSkeleton } from "../AppSkelaton"
import { fetchBranches, type BranchRow } from "@/lib/config"

type Branch = BranchRow

// Create columns function that accepts onUpdate callback
const createColumns = (onUpdate: () => void): ColumnDef<Branch>[] => [
    {
        accessorKey: "name",
        header: () => <span className="font-semibold">Branch Name</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconBuilding className="size-5" />
                </div>
                <div>
                    <div className="font-semibold text-foreground">{row.getValue("name")}</div>
                </div>
            </div>
        ),
    },
    {
        accessorKey: "address",
        header: () => <span className="font-semibold">Address</span>,
        cell: ({ row }) => {
            const address = row.getValue("address") as string
            return (
                <div className="flex items-start gap-2 max-w-md">
                    <IconMapPin className="size-4 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-sm leading-relaxed">
                        {address || <span className="italic">No address provided</span>}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "createdAt",
        header: () => <span className="font-semibold">Created At</span>,
        cell: ({ row }) => {
            const dateStr = row.getValue("createdAt") as string
            if (!dateStr) return (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="size-4" />
                    <span className="text-sm">-</span>
                </div>
            )

            try {
                const date = new Date(dateStr)
                const formatted = date.toISOString().split('T')[0]
                return (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <IconCalendar className="size-4" />
                        <span className="text-sm">{formatted}</span>
                    </div>
                )
            } catch {
                return (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <IconCalendar className="size-4" />
                        <span className="text-sm">{dateStr}</span>
                    </div>
                )
            }
        },
    },
    {
        id: "actions",
        header: () => <span className="font-semibold">Actions</span>,
        cell: ({ row }) => <BranchActions branch={row.original} onUpdate={onUpdate} />,
    },
]

function BranchActions({ branch, onUpdate }: { branch: Branch; onUpdate: () => void }) {
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
                    <BranchEditForm branch={branch} onUpdate={onUpdate}>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                            Edit
                        </DropdownMenuItem>
                    </BranchEditForm>
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

            <DeleteBranch
                branch={branch}
                onUpdate={onUpdate}
                isOpen={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
            />
        </>
    )
}

export default function Branches() {
    const [branches, setBranches] = React.useState<Branch[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

    const loadBranches = React.useCallback(async () => {
        try {
            setIsLoading(true)
            const result = await fetchBranches()
            setBranches(result.data || [])
        } catch (error) {
            console.error("Fetch error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to fetch branches")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        loadBranches()
    }, [loadBranches])

    const columns = React.useMemo(() => createColumns(loadBranches), [loadBranches])

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

    return (
        <section className="space-y-6">
            {/* Header Section */}
            <Card className="border-2 bg-linear-to-br from-card via-card to-muted/20 shadow-lg overflow-hidden">
                <CardContent>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-lg ring-2 ring-primary/20">
                                    <IconBuilding className="size-7" />
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        Branches
                                    </h1>
                                    {!isLoading && branches.length > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                            {branches.length} {branches.length === 1 ? 'branch' : 'branches'}
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Manage your branch locations and information. Create, edit, and organize all your business branches in one place.
                                </p>
                            </div>
                        </div>
                        <div className="shrink-0">
                            <BranchCreateForm onUpdate={loadBranches} />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Card */}
            <div className="grid gap-4 md:grid-cols-3">
                {isLoading ? (
                    <CardSkeleton count={3} />
                ) : (
                    <>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Total Branches</span>
                                    <IconBuilding className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{branches.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Displayed</span>
                                    <IconMapPin className="size-4 text-muted-foreground" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{table.getRowModel().rows.length}</div>
                            </CardContent>
                        </Card>
                        <Card className="border-2">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">Status</span>
                                    <div className="size-2 rounded-full bg-green-500" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">Active</div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>

            {/* Table Card */}
            <Card className="border-2">
                <CardContent className="p-0">
                    <div className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id} className="border-b-2">
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id} className="h-12 px-6">
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
                                {isLoading ? (
                                    <AppSkeleton rows={5} />
                                ) : table.getRowModel().rows?.length ? (
                                    table.getRowModel().rows.map((row) => (
                                        <TableRow
                                            key={row.id}
                                            className="border-b transition-colors hover:bg-muted/50 cursor-pointer"
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id} className="px-6 py-4">
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
                                            className="h-64 text-center"
                                        >
                                            <div className="flex flex-col items-center justify-center gap-4 py-8">
                                                <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                                                    <IconBuilding className="size-8 text-muted-foreground" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-lg font-semibold">No branches found</h3>
                                                    <p className="text-sm text-muted-foreground max-w-sm">
                                                        Get started by creating your first branch location
                                                    </p>
                                                </div>
                                                <BranchCreateForm onUpdate={loadBranches} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Info */}
            {!isLoading && branches.length > 0 && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                    <div className="text-sm text-muted-foreground">
                        Showing <span className="font-semibold text-foreground">{table.getRowModel().rows.length}</span> of{" "}
                        <span className="font-semibold text-foreground">{branches.length}</span> branch{branches.length !== 1 ? "es" : ""}
                    </div>
                </div>
            )}
        </section>
    )
}
