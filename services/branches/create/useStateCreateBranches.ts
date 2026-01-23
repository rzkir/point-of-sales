import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG } from "@/lib/config"

export function useStateCreateBranches({ onUpdate }: UseCreateBranchProps) {
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
            const response = await fetch(API_CONFIG.ENDPOINTS.branches.base, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
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

    return {
        isOpen,
        setIsOpen,
        isSubmitting,
        formRef,
        handleSubmit,
    }
}
