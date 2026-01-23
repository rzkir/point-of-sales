import { Badge } from "@/components/ui/badge"

import { IconCategory, IconCalendar } from "@tabler/icons-react"

import {
    type ColumnDef,
} from "@tanstack/react-table"

import { CategoryActions } from "@/components/dashboard/categories/modal/CategoryActions"

export const CreateColumnsCategories = (onUpdate: () => void): ColumnDef<CategoryRow>[] => [
    {
        accessorKey: "name",
        header: () => <span className="font-semibold">Name</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconCategory className="size-5" />
                </div>
                <div className="font-semibold text-foreground">{row.getValue("name")}</div>
            </div>
        ),
    },
    {
        accessorKey: "is_active",
        header: () => <span className="font-semibold">Status</span>,
        cell: ({ row }) => {
            const isActive = row.getValue("is_active") as boolean
            return (
                <Badge className={isActive ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    {
        accessorKey: "created_at",
        header: () => <span className="font-semibold">Created At</span>,
        cell: ({ row }) => {
            const dateStr = row.getValue("created_at") as string
            if (!dateStr) return (
                <div className="flex items-center gap-2 text-muted-foreground">
                    <IconCalendar className="size-4" />
                    <span className="text-sm">-</span>
                </div>
            )

            try {
                const date = new Date(dateStr)
                const formatted = date.toISOString().split("T")[0]
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
        cell: ({ row }) => <CategoryActions category={row.original} onUpdate={onUpdate} />,
    },
]