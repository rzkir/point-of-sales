import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG, fetchBranches } from "@/lib/config"

export function useStateCreateCashLog({ onUpdate, user }: UseCreateCashLogProps) {
    const [isOpen, setIsOpen] = React.useState(false)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [branches, setBranches] = React.useState<BranchRow[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    const useLoggedInUser = Boolean(user?.name && user?.branchName)

    React.useEffect(() => {
        if (useLoggedInUser) return
        const load = async () => {
            try {
                setIsLoadingBranches(true)
                const res = await fetchBranches()
                setBranches(res.data || [])
            } catch {
                setBranches([])
            } finally {
                setIsLoadingBranches(false)
            }
        }
        if (isOpen) void load()
    }, [isOpen, useLoggedInUser])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        const date = formData.get("date") as string
        const amount = formData.get("amount") as string
        const type = (formData.get("type") as "opening_cash" | "closing_cash") || "opening_cash"
        const cashier_name = useLoggedInUser ? (user?.name || user?.email || "") : (formData.get("cashier_name") as string) || ""
        const branch_name = useLoggedInUser ? (user?.branchName || "") : (formData.get("branch_name") as string) || ""

        if (!date?.trim()) {
            toast.error("Tanggal wajib diisi")
            setIsSubmitting(false)
            return
        }
        const amountNum = Number(amount)
        if (isNaN(amountNum) || amountNum < 0) {
            toast.error("Jumlah kas wajib diisi dan harus angka valid")
            setIsSubmitting(false)
            return
        }
        if (!branch_name?.trim()) {
            toast.error("Cabang wajib diisi (pastikan akun Anda punya cabang)")
            setIsSubmitting(false)
            return
        }

        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.cashlog.base, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                credentials: "include",
                body: JSON.stringify({
                    date: date.trim(),
                    amount: amountNum,
                    cashier_name: cashier_name.trim(),
                    branch_name: branch_name.trim(),
                    type,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Gagal membuat pembekuan kas")
            }

            toast.success("Pembekuan kas berhasil dibuat")
            setIsOpen(false)
            formRef.current?.reset()
            onUpdate()
        } catch (error) {
            console.error("Create cash log error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal membuat pembekuan kas")
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
        branches,
        isLoadingBranches,
        useLoggedInUser,
    }
}
