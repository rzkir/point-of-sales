import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG } from "@/lib/config"

export function useStateCreateCategories({ onUpdate }: UseCreateCategoryProps) {
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
