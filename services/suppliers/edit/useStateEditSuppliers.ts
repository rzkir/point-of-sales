"use client"

import * as React from "react"

import { toast } from "sonner"

export function useStateEditSuppliers(supplier: SupplierRow, onUpdate: () => void) {
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
                    is_active: isActive,
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

    return {
        isOpen,
        isSubmitting,
        isActive,
        formRef,
        setIsOpen,
        setIsActive,
        handleSubmit,
    }
}