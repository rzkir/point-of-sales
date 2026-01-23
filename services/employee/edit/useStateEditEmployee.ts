"use client"

import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG, fetchBranches as fetchBranchesFromConfig } from "@/lib/config"

export function useStateEditEmployee(employee: Employee, onUpdate: () => void) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [roleType, setRoleType] = React.useState(employee.roleType || "karyawan")
    const [branchName, setBranchName] = React.useState(employee.branchName || "none")
    const [branches, setBranches] = React.useState<BranchRow[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    React.useEffect(() => {
        if (isOpen) {
            void fetchBranches()
        }
    }, [isOpen])

    const fetchBranches = async () => {
        setIsLoadingBranches(true)
        try {
            const result = await fetchBranchesFromConfig()
            setBranches(result.data || [])
        } catch (error) {
            console.error("Failed to fetch branches:", error)
        } finally {
            setIsLoadingBranches(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const name = formData.get("name") as string
        const email = formData.get("email") as string

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.employees.byId(employee.id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                body: JSON.stringify({
                    name,
                    email,
                    roleType,
                    branchName: branchName === "none" ? null : branchName,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to update employee")
            }

            toast.success("Employee updated successfully")
            setIsOpen(false)
            onUpdate()
        } catch (error) {
            console.error("Update error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update employee")
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        // state
        isOpen,
        isSubmitting,
        roleType,
        branchName,
        branches,
        isLoadingBranches,
        formRef,
        // setters
        setIsOpen,
        setRoleType,
        setBranchName,
        // handlers
        handleSubmit,
    }
}