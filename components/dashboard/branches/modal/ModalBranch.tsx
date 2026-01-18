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

interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

interface BranchEditFormProps {
    branch: Branch
    onUpdate: () => void
    children: React.ReactElement
}

export function BranchEditForm({
    branch,
    onUpdate,
    children,
}: BranchEditFormProps) {
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Branch</DialogTitle>
                    <DialogDescription>
                        Update branch information
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                            "Update Branch"
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

interface BranchCreateFormProps {
    onUpdate: () => void
}

export function BranchCreateForm({ onUpdate }: BranchCreateFormProps) {
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                <Button className="shadow-sm hover:shadow-md transition-shadow">
                    <IconPlus className="mr-2 size-4" />
                    <span className="hidden lg:inline">Add Branch</span>
                    <span className="lg:hidden">Add</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Branch</DialogTitle>
                    <DialogDescription>
                        Add a new branch to the system
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                            "Create Branch"
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
