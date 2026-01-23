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

import { Switch } from "@/components/ui/switch"

import { useStateEditSuppliers } from "@/services/suppliers/edit/useStateEditSuppliers"

import { useStateCreateSuppliers } from "@/services/suppliers/create/useStateCreateSuppliers"

export function SupplierEditForm({
    supplier,
    onUpdate,
    children,
}: SupplierEditFormProps) {
    const {
        isOpen,
        isSubmitting,
        isActive,
        formRef,
        setIsOpen,
        setIsActive,
        handleSubmit,
    } = useStateEditSuppliers(supplier, onUpdate)

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
    const {
        isOpen,
        isSubmitting,
        isActive,
        formRef,
        setIsOpen,
        setIsActive,
        handleSubmit,
    } = useStateCreateSuppliers(onUpdate)

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