import { IconUser, IconMail, IconCalendar, IconShield, IconBuilding } from "@tabler/icons-react"

import {
    type ColumnDef,
} from "@tanstack/react-table"

import { EmployeeActions } from "@/components/dashboard/employees/modal/EmployeeActions"

import { Badge } from "@/components/ui/badge"

export const CreateColumns = (onUpdate: () => void): ColumnDef<EmployeeRow>[] => [
    {
        accessorKey: "name",
        header: () => <span className="font-semibold">Name</span>,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <IconUser className="size-5" />
                </div>
                <div>
                    <div className="font-semibold text-foreground">{row.getValue("name")}</div>
                </div>
            </div>
        ),
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
        accessorKey: "roleType",
        header: () => <span className="font-semibold">Role</span>,
        cell: ({ row }) => {
            const roleType = row.getValue("roleType") as string
            const roleColors: Record<string, string> = {
                super_admin: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
                admin: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
                karyawan: "bg-green-500/10 text-green-700 dark:text-green-400",
            }
            return (
                <div className="flex items-center gap-2">
                    <IconShield className="size-4 text-muted-foreground" />
                    <Badge className={roleColors[roleType] || "bg-gray-500/10 text-gray-700 dark:text-gray-400"}>
                        {roleType || "N/A"}
                    </Badge>
                </div>
            )
        },
    },
    {
        accessorKey: "branchName",
        header: () => <span className="font-semibold">Branch</span>,
        cell: ({ row }) => {
            const branchName = row.getValue("branchName") as string
            return (
                <div className="flex items-center gap-2">
                    <IconBuilding className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {branchName ? branchName : <span className="italic">No Branch</span>}
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
        cell: ({ row }) => <EmployeeActions employee={row.original} onUpdate={onUpdate} />,
    },
]