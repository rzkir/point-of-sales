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

import { useStateCreateCategories } from "@/services/categories/create/useStateCreateCategories"

import { useStateEditCategories } from "@/services/categories/edit/useStateEditCategories"

export function CategoryEditForm({
    category,
    onUpdate,
    children,
}: CategoryEditFormProps) {
    const { isOpen, setIsOpen, isSubmitting, isActive, setIsActive, formRef, handleSubmit } =
        useStateEditCategories({ categoryId: category.id, onUpdate, initialIsActive: category.is_active })

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
    const { isOpen, setIsOpen, isSubmitting, isActive, setIsActive, formRef, handleSubmit } =
        useStateCreateCategories({ onUpdate })

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
