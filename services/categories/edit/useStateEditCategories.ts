import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG } from "@/lib/config"

export function useStateEditCategories({ categoryId, onUpdate, initialIsActive }: UseEditCategoryProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isActive, setIsActive] = React.useState(initialIsActive ?? true)
    const formRef = React.useRef<HTMLFormElement>(null)

    React.useEffect(() => {
        if (isOpen) {
            setIsActive(initialIsActive ?? true)
        }
    }, [isOpen, initialIsActive])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.categories.byId(categoryId), {
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

    return {
        isOpen,
        setIsOpen,
        isSubmitting,
        isActive,
        setIsActive,
        formRef,
        handleSubmit,
    }
}
