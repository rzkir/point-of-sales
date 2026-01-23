import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG } from "@/lib/config"

export function useStateEditBranches({ branchId, onUpdate }: UseEditBranchProps) {
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
            const response = await fetch(API_CONFIG.ENDPOINTS.branches.byId(branchId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
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

    return {
        isOpen,
        setIsOpen,
        isSubmitting,
        formRef,
        handleSubmit,
    }
}
