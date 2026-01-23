import { Badge } from "@/components/ui/badge"

import { IconBuilding, IconMail, IconCalendar, IconPhone, IconUser, IconMapPin } from "@tabler/icons-react"

import {
    type ColumnDef,
} from "@tanstack/react-table"

import { SupplierActions } from "@/components/dashboard/suppliers/modal/SupplierActions"

export const CreateColumns = (onUpdate: () => void): ColumnDef<SupplierRow>[] => [
    {
        accessorKey: "name",
        header: () => <span className="font-semibold">Name</span>,
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
        accessorKey: "contact_person",
        header: () => <span className="font-semibold">Contact Person</span>,
        cell: ({ row }) => {
            const contactPerson = row.getValue("contact_person") as string
            return (
                <div className="flex items-center gap-2 max-w-md">
                    <IconUser className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-sm">
                        {contactPerson || <span className="italic">No contact person</span>}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "phone",
        header: () => <span className="font-semibold">Phone</span>,
        cell: ({ row }) => {
            const phone = row.getValue("phone") as string
            return (
                <div className="flex items-center gap-2 max-w-md">
                    <IconPhone className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-sm">
                        {phone || <span className="italic">No phone</span>}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "email",
        header: () => <span className="font-semibold">Email</span>,
        cell: ({ row }) => {
            const email = row.getValue("email") as string
            return (
                <div className="flex items-center gap-2 max-w-md">
                    <IconMail className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-sm">
                        {email || <span className="italic">No email provided</span>}
                    </span>
                </div>
            )
        },
    },
    {
        accessorKey: "address",
        header: () => <span className="font-semibold">Address</span>,
        cell: ({ row }) => {
            const address = row.getValue("address") as string
            return (
                <div className="flex items-center gap-2 max-w-md">
                    <IconMapPin className="size-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground text-sm">
                        {address || <span className="italic">No address</span>}
                    </span>
                </div>
            )
        },
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
        cell: ({ row }) => <SupplierActions supplier={row.original} onUpdate={onUpdate} />,
    },
]