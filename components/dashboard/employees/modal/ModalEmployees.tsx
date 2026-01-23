"use client"

import { IconLoader, IconPlus } from "@tabler/icons-react"

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

import { useStateEditEmployee } from "@/services/employee/edit/useStateEditEmployee"

import { useStateCreateEmployee } from "@/services/employee/create/useStateCreateEmployee"

export function EmployeeEditForm({
    employee,
    onUpdate,
    children,
}: EmployeeEditFormProps) {
    const {
        isOpen,
        isSubmitting,
        roleType,
        branchName,
        branches,
        isLoadingBranches,
        formRef,
        setIsOpen,
        setRoleType,
        setBranchName,
        handleSubmit,
    } = useStateEditEmployee(employee, onUpdate)

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
    const {
        isOpen,
        isSubmitting,
        roleType,
        branchName,
        branches,
        isLoadingBranches,
        formRef,
        setIsOpen,
        setRoleType,
        setBranchName,
        handleSubmit,
    } = useStateCreateEmployee(onUpdate)

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
