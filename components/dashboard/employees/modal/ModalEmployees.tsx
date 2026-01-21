"use client"

import * as React from "react"
import { IconLoader, IconPlus } from "@tabler/icons-react"
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
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

interface Employee {
    id: string
    name: string
    email: string
    roleType: string
    branchId?: string
    branchName?: string
    createdAt: string
    updatedAt: string
}

interface EmployeeEditFormProps {
    employee: Employee
    onUpdate: () => void
    children: React.ReactElement
}

export function EmployeeEditForm({
    employee,
    onUpdate,
    children,
}: EmployeeEditFormProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [roleType, setRoleType] = React.useState(employee.roleType || "karyawan")
    const [branchName, setBranchName] = React.useState(employee.branchName || "none")
    const [branches, setBranches] = React.useState<Branch[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    // Fetch branches when dialog opens
    React.useEffect(() => {
        if (isOpen) {
            fetchBranches()
        }
    }, [isOpen])

    const fetchBranches = async () => {
        setIsLoadingBranches(true)
        try {
            const response = await fetch("/api/branches")
            const data = await response.json()
            if (data.success) {
                setBranches(data.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch branches:", error)
        } finally {
            setIsLoadingBranches(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string

        try {
            const response = await fetch(`/api/employees/${employee.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, roleType, branchName: branchName === "none" ? null : branchName }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to update employee")
            }

            toast.success("Employee updated successfully")
            setIsOpen(false)
            onUpdate()
        } catch (error) {
            console.error("Update error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update employee")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Employee</DialogTitle>
                    <DialogDescription>
                        Update employee information
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                            <Input
                                id="edit-name"
                                name="name"
                                defaultValue={employee.name}
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                            <Input
                                id="edit-email"
                                name="email"
                                type="email"
                                defaultValue={employee.email}
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-roleType">Role</FieldLabel>
                            <Select value={roleType} onValueChange={setRoleType} disabled={isSubmitting}>
                                <SelectTrigger id="edit-roleType">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="karyawan">Karyawan</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-branchName">Branch</FieldLabel>
                            <Select value={branchName} onValueChange={setBranchName} disabled={isSubmitting || isLoadingBranches}>
                                <SelectTrigger id="edit-branchName">
                                    <SelectValue placeholder={isLoadingBranches ? "Loading branches..." : "Select branch"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Branch</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.name}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                </form>
                <DialogFooter>
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
                            "Update Employee"
                        )}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface EmployeeCreateFormProps {
    onUpdate: () => void
}

export function EmployeeCreateForm({ onUpdate }: EmployeeCreateFormProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [roleType, setRoleType] = React.useState("karyawan")
    const [branchName, setBranchName] = React.useState("none")
    const [branches, setBranches] = React.useState<Branch[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    // Fetch branches when dialog opens
    React.useEffect(() => {
        if (isOpen) {
            fetchBranches()
        }
    }, [isOpen])

    const fetchBranches = async () => {
        setIsLoadingBranches(true)
        try {
            const response = await fetch("/api/branches")
            const data = await response.json()
            if (data.success) {
                setBranches(data.data || [])
            }
        } catch (error) {
            console.error("Failed to fetch branches:", error)
        } finally {
            setIsLoadingBranches(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string
        const password = formData.get("password") as string

        try {
            const response = await fetch("/api/employees", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password, roleType, branchName: branchName === "none" ? null : branchName }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to create employee")
            }

            toast.success("Employee created successfully")
            setIsOpen(false)
            formRef.current?.reset()
            setRoleType("karyawan")
            setBranchName("none")
            onUpdate()
        } catch (error) {
            console.error("Create error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create employee")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                <Button className="shadow-sm hover:shadow-md transition-shadow">
                    <IconPlus className="mr-2 size-4" />
                    <span className="hidden lg:inline">Add Employee</span>
                    <span className="lg:hidden">Add</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Employee</DialogTitle>
                    <DialogDescription>
                        Add a new employee to the system
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="create-name">Name</FieldLabel>
                            <Input
                                id="create-name"
                                name="name"
                                placeholder="Enter employee name"
                                required
                                disabled={isSubmitting}
                            />
                            <FieldDescription>
                                Employee name is required
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-email">Email</FieldLabel>
                            <Input
                                id="create-email"
                                name="email"
                                type="email"
                                placeholder="Enter email address"
                                required
                                disabled={isSubmitting}
                            />
                            <FieldDescription>
                                Email must be unique
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-password">Password</FieldLabel>
                            <Input
                                id="create-password"
                                name="password"
                                type="password"
                                placeholder="Enter password"
                                required
                                disabled={isSubmitting}
                            />
                            <FieldDescription>
                                Password will be hashed for security
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-roleType">Role</FieldLabel>
                            <Select value={roleType} onValueChange={setRoleType} disabled={isSubmitting}>
                                <SelectTrigger id="create-roleType">
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="super_admin">Super Admin</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                    <SelectItem value="karyawan">Karyawan</SelectItem>
                                </SelectContent>
                            </Select>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-branchName">Branch</FieldLabel>
                            <Select value={branchName} onValueChange={setBranchName} disabled={isSubmitting || isLoadingBranches}>
                                <SelectTrigger id="create-branchName">
                                    <SelectValue placeholder={isLoadingBranches ? "Loading branches..." : "Select branch"} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Branch</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.name}>
                                            {branch.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldDescription>
                                Assign employee to a branch (optional)
                            </FieldDescription>
                        </Field>
                    </FieldGroup>
                </form>
                <DialogFooter>
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
                            "Create Employee"
                        )}
                    </Button>
                    <DialogClose asChild>
                        <Button variant="outline" disabled={isSubmitting}>
                            Cancel
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
