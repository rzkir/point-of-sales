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
import { Switch } from "@/components/ui/switch"
import { API_CONFIG, type SupplierRow } from "@/lib/config"

type Supplier = SupplierRow

interface SupplierEditFormProps {
    supplier: Supplier
    onUpdate: () => void
    children: React.ReactElement
}

export function SupplierEditForm({
    supplier,
    onUpdate,
    children,
}: SupplierEditFormProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isActive, setIsActive] = React.useState(supplier.is_active ?? true)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const contact_person = formData.get("contact_person") as string
        const phone = formData.get("phone") as string
        const email = formData.get("email") as string
        const address = formData.get("address") as string

        try {
            const response = await fetch(`/api/supplier/${supplier.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    contact_person,
                    phone,
                    email,
                    address,
                    is_active: isActive
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to update supplier")
            }

            toast.success("Supplier updated successfully")
            setIsOpen(false)
            onUpdate()
        } catch (error) {
            console.error("Update error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update supplier")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Supplier</DialogTitle>
                    <DialogDescription>
                        Update supplier information
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                            <Input
                                id="edit-name"
                                name="name"
                                defaultValue={supplier.name}
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-contact-person">Contact Person</FieldLabel>
                            <Input
                                id="edit-contact-person"
                                name="contact_person"
                                defaultValue={supplier.contact_person}
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-phone">Phone</FieldLabel>
                            <Input
                                id="edit-phone"
                                name="phone"
                                type="tel"
                                defaultValue={supplier.phone}
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-email">Email</FieldLabel>
                            <Input
                                id="edit-email"
                                name="email"
                                type="email"
                                defaultValue={supplier.email}
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="edit-address">Address</FieldLabel>
                            <Input
                                id="edit-address"
                                name="address"
                                defaultValue={supplier.address}
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <div>
                                    <FieldLabel htmlFor="edit-is-active">Active</FieldLabel>
                                    <FieldDescription>
                                        If inactive, supplier will not be shown in active lists.
                                    </FieldDescription>
                                </div>
                                <Switch
                                    id="edit-is-active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                    disabled={isSubmitting}
                                />
                            </div>
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
                            "Update Supplier"
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

interface SupplierCreateFormProps {
    onUpdate: () => void
}

export function SupplierCreateForm({ onUpdate }: SupplierCreateFormProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isActive, setIsActive] = React.useState(true)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const contact_person = formData.get("contact_person") as string
        const phone = formData.get("phone") as string
        const email = formData.get("email") as string
        const address = formData.get("address") as string

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.suppliers.base, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                body: JSON.stringify({
                    name,
                    contact_person,
                    phone,
                    email,
                    address,
                    is_active: isActive
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to create supplier")
            }

            toast.success("Supplier created successfully")
            setIsOpen(false)
            formRef.current?.reset()
            setIsActive(true)
            onUpdate()
        } catch (error) {
            console.error("Create error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create supplier")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                <Button className="shadow-sm hover:shadow-md transition-shadow">
                    <IconPlus className="mr-2 size-4" />
                    <span className="hidden lg:inline">Add Supplier</span>
                    <span className="lg:hidden">Add</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Supplier</DialogTitle>
                    <DialogDescription>
                        Add a new supplier to the system
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="create-name">Name</FieldLabel>
                            <Input
                                id="create-name"
                                name="name"
                                placeholder="Enter supplier name"
                                required
                                disabled={isSubmitting}
                            />
                            <FieldDescription>
                                Supplier name is required
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-contact-person">Contact Person</FieldLabel>
                            <Input
                                id="create-contact-person"
                                name="contact_person"
                                placeholder="Enter contact person name"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-phone">Phone</FieldLabel>
                            <Input
                                id="create-phone"
                                name="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-email">Email</FieldLabel>
                            <Input
                                id="create-email"
                                name="email"
                                type="email"
                                placeholder="Enter email address"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="create-address">Address</FieldLabel>
                            <Input
                                id="create-address"
                                name="address"
                                placeholder="Enter supplier address"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <div>
                                    <FieldLabel htmlFor="create-is-active">Active</FieldLabel>
                                    <FieldDescription>
                                        If inactive, supplier will not be shown in active lists.
                                    </FieldDescription>
                                </div>
                                <Switch
                                    id="create-is-active"
                                    checked={isActive}
                                    onCheckedChange={setIsActive}
                                    defaultChecked
                                    disabled={isSubmitting}
                                />
                            </div>
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
                            "Create Supplier"
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