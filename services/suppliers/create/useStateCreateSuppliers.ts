"use client"

import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG } from "@/lib/config"

export function useStateCreateSuppliers(onUpdate: () => void) {
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
                    is_active: isActive,
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