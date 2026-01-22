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
import { API_CONFIG, type CategoryRow } from "@/lib/config"

type Category = CategoryRow

interface CategoryEditFormProps {
    category: Category
    onUpdate: () => void
    children: React.ReactElement
}

export function CategoryEditForm({
    category,
    onUpdate,
    children,
}: CategoryEditFormProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isActive, setIsActive] = React.useState(category.is_active ?? true)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.categories.byId(category.id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                body: JSON.stringify({
                    name,
                    is_active: isActive,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to update category")
            }

            toast.success("Category updated successfully")
            setIsOpen(false)
            onUpdate()
        } catch (error) {
            console.error("Update category error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update category")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                {children}
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Edit Category</DialogTitle>
                    <DialogDescription>
                        Update category details
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="edit-name">Name</FieldLabel>
                            <Input
                                id="edit-name"
                                name="name"
                                defaultValue={category.name}
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <div>
                                    <FieldLabel htmlFor="edit-is-active">Active</FieldLabel>
                                    <FieldDescription>
                                        Toggle to control whether this category is active.
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
                            "Update Category"
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

interface CategoryCreateFormProps {
    onUpdate: () => void
}

export function CategoryCreateForm({ onUpdate }: CategoryCreateFormProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isActive, setIsActive] = React.useState(true)
    const formRef = React.useRef<HTMLFormElement>(null)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.categories.base, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                body: JSON.stringify({
                    name,
                    is_active: isActive,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to create category")
            }

            toast.success("Category created successfully")
            setIsOpen(false)
            formRef.current?.reset()
            setIsActive(true)
            onUpdate()
        } catch (error) {
            console.error("Create category error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create category")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild onClick={() => setIsOpen(true)}>
                <Button className="shadow-sm hover:shadow-md transition-shadow">
                    <IconPlus className="mr-2 size-4" />
                    <span className="hidden lg:inline">Add Category</span>
                    <span className="lg:hidden">Add</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                        Add a new category to group your products.
                    </DialogDescription>
                </DialogHeader>
                <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="create-name">Name</FieldLabel>
                            <Input
                                id="create-name"
                                name="name"
                                placeholder="Enter category name"
                                required
                                disabled={isSubmitting}
                            />
                            <FieldDescription>
                                Category name is required.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <div className="flex items-center justify-between rounded-md border px-3 py-2">
                                <div>
                                    <FieldLabel htmlFor="create-is-active">Active</FieldLabel>
                                    <FieldDescription>
                                        If inactive, category will be hidden from selections.
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
                            "Create Category"
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
