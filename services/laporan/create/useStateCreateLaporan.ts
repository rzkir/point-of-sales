"use client"

import * as React from "react"
import { toast } from "sonner"
import { API_CONFIG } from "@/lib/config"

export type CreateLaporanParams = {
    date: string
    category: StoreExpense["category"]
    amount: number
    description?: string
    receiptFile?: File
}

export type UseStateCreateLaporanOptions = {
    uploadReceipt: (file: File) => Promise<string>
    onSuccess?: () => void
}

export function useStateCreateLaporan(
    branchName: string | undefined,
    options: UseStateCreateLaporanOptions
) {
    const { uploadReceipt, onSuccess } = options
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const createLaporan = React.useCallback(
        async (params: CreateLaporanParams) => {
            const { date, category, amount, description, receiptFile } = params

            if (!date?.trim()) {
                toast.error("Tanggal wajib diisi")
                return
            }
            const amountNum = Number(amount)
            if (isNaN(amountNum) || amountNum < 0) {
                toast.error("Jumlah harus angka valid")
                return
            }
            if (!branchName?.trim()) {
                toast.error("Cabang tidak ditemukan (pastikan akun Anda punya cabang)")
                return
            }

            setIsSubmitting(true)

            let receipt_url = ""
            if (receiptFile) {
                try {
                    receipt_url = await uploadReceipt(receiptFile)
                } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Gagal mengunggah bukti")
                    setIsSubmitting(false)
                    return
                }
            }

            try {
                const response = await fetch(API_CONFIG.ENDPOINTS.laporan.base, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_CONFIG.SECRET}`,
                    },
                    credentials: "include",
                    body: JSON.stringify({
                        date: date.trim(),
                        category,
                        amount: amountNum,
                        description: (description ?? "").trim(),
                        branch_name: branchName.trim(),
                        receipt_url: receipt_url || undefined,
                    }),
                })
                const data = await response.json()
                if (!data.success) throw new Error(data.message || "Gagal mengirim laporan")
                toast.success("Laporan pengeluaran berhasil dikirim")
                onSuccess?.()
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Gagal mengirim laporan")
            } finally {
                setIsSubmitting(false)
            }
        },
        [branchName, uploadReceipt, onSuccess]
    )

    return { createLaporan, isSubmitting }
}
