import * as React from "react"

import { toast } from "sonner"

import { API_CONFIG } from "@/lib/config"

export function useStateEditCashLog({ onUpdate }: UseEditCashLogProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [submittingId, setSubmittingId] = React.useState<string | null>(null)

    const updateStatus = React.useCallback(
        async (cashLogId: string, status: "approved" | "rejected") => {
            if (!cashLogId) return
            setSubmittingId(cashLogId)
            setIsSubmitting(true)
            try {
                const response = await fetch(API_CONFIG.ENDPOINTS.cashlog.byId(cashLogId), {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${API_CONFIG.SECRET}`,
                    },
                    credentials: "include",
                    body: JSON.stringify({ status }),
                })

                const data = await response.json()

                if (!data.success) {
                    throw new Error(data.message || "Gagal mengubah status pembekuan kas")
                }

                toast.success(status === "approved" ? "Pembekuan kas disetujui" : "Pembekuan kas ditolak")
                onUpdate()
            } catch (error) {
                console.error("Update cash log status error:", error)
                toast.error(error instanceof Error ? error.message : "Gagal mengubah status")
            } finally {
                setIsSubmitting(false)
                setSubmittingId(null)
            }
        },
        [onUpdate]
    )

    return {
        isSubmitting,
        submittingId,
        updateStatus,
    }
}
