import { BranchActions } from "./BranchActions"

import { IconBuilding, IconMapPin, IconCalendar } from "@tabler/icons-react"

import { ColumnDef } from "@tanstack/react-table"

export const createColumns = (onUpdate: () => void): ColumnDef<BranchRow>[] => [
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
        cell: ({ row }) => <BranchActions branch={row.original as Branch} onUpdate={onUpdate} />,
    },
]
