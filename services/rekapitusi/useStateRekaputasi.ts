import * as React from "react"

import { useStateTransactions } from "@/services/transactions/useStateTransactions"

import { ChartConfig } from "@/components/ui/chart"

export type RekapTimeRange = "90d" | "30d" | "7d"

export const chartConfig = {
    revenue: {
        label: "Pendapatan",
        color: "var(--primary)",
    },
    transactions: {
        label: "Jumlah Transaksi",
        color: "hsl(var(--chart-2))",
    },
} satisfies ChartConfig

export const topProductsChartConfig = {
    quantity: {
        label: "Jumlah Terjual",
        color: "hsl(var(--chart-5))",
    },
} satisfies ChartConfig

export function useStateRekapitusi() {
    const transactionsState = useStateTransactions()

    const { allFilteredTransactions } = transactionsState

    const chartData = React.useMemo(() => {
        const map = new Map<string, { date: string; revenue: number; transactions: number }>()

        allFilteredTransactions.forEach((t: TransactionRow) => {
            const date = new Date(t.created_at)
            const key = date.toISOString().slice(0, 10)

            if (!map.has(key)) {
                map.set(key, { date: key, revenue: 0, transactions: 0 })
            }

            const current = map.get(key)!
            current.revenue += t.total || 0
            current.transactions += 1
        })

        return Array.from(map.values()).sort((a, b) => (a.date > b.date ? 1 : -1))
    }, [allFilteredTransactions])

    const [timeRange, setTimeRange] = React.useState<RekapTimeRange>("90d")

    const filteredChartData = React.useMemo(() => {
        if (chartData.length === 0) return chartData

        const dates = chartData.map((d) => new Date(d.date).getTime())
        const maxTime = Math.max(...dates)

        let daysToSubtract = 90
        if (timeRange === "30d") {
            daysToSubtract = 30
        } else if (timeRange === "7d") {
            daysToSubtract = 7
        }

        const cutoff = maxTime - daysToSubtract * 24 * 60 * 60 * 1000

        return chartData.filter((d) => new Date(d.date).getTime() >= cutoff)
    }, [chartData, timeRange])

    const [activeBarMetric, setActiveBarMetric] = React.useState<"revenue" | "transactions">("revenue")

    const totals = React.useMemo(
        () => ({
            revenue: filteredChartData.reduce((acc, curr) => acc + (curr.revenue || 0), 0),
            transactions: filteredChartData.reduce((acc, curr) => acc + (curr.transactions || 0), 0),
        }),
        [filteredChartData]
    )

    const customerDebts = React.useMemo(() => {
        const map = new Map<
            string,
            {
                customer: string
                totalDebt: number
                transactions: number
            }
        >()

        allFilteredTransactions.forEach((t: TransactionRow) => {
            const debt =
                t.due_amount !== undefined
                    ? t.due_amount
                    : Math.max(0, (t.total || 0) - (t.paid_amount || 0))

            if (debt <= 0) return

            const identifier = String(
                (t as TransactionRow & { customer_id?: string | number }).customer_id ?? t.customer_name ?? ""
            ).trim()

            if (!identifier) return

            const existing = map.get(identifier) ?? {
                customer: t.customer_name || identifier || "Tanpa nama",
                totalDebt: 0,
                transactions: 0,
            }

            existing.totalDebt += debt
            existing.transactions += 1

            map.set(identifier, existing)
        })

        return Array.from(map.values()).sort((a, b) => b.totalDebt - a.totalDebt)
    }, [allFilteredTransactions])

    const paymentStatusData = React.useMemo(
        () => {
            let withDebt = 0
            let noDebt = 0

            allFilteredTransactions.forEach((t: TransactionRow) => {
                const debt =
                    t.due_amount !== undefined
                        ? t.due_amount
                        : Math.max(0, (t.total || 0) - (t.paid_amount || 0))

                if (debt > 0) {
                    withDebt += 1
                } else {
                    noDebt += 1
                }
            })

            return [
                {
                    status: "withDebt",
                    value: withDebt,
                },
                {
                    status: "noDebt",
                    value: noDebt,
                },
            ]
        },
        [allFilteredTransactions]
    )

    const topProducts = React.useMemo(() => {
        type TopProductItem = {
            product_id?: string | number
            product_name: string
            image_url?: string
            quantity: number
            price: number
            subtotal?: number
            unit?: string
        }

        const map = new Map<
            string,
            {
                product: string
                quantity: number
                revenue: number
            }
        >()

        allFilteredTransactions.forEach((t: TransactionRow) => {
            const rawItems = t.items

            let items: TopProductItem[] = []

            if (Array.isArray(rawItems)) {
                items = rawItems as TopProductItem[]
            } else if (typeof rawItems === "string" && rawItems.trim() !== "") {
                try {
                    const parsed = JSON.parse(rawItems)
                    if (Array.isArray(parsed)) {
                        items = parsed as TopProductItem[]
                    }
                } catch {
                    // ignore parse error, treat as no items
                }
            }

            if (!items.length) return

            items.forEach((item: TopProductItem) => {
                const name = String(item.product_name || "").trim()
                const qty = Number(item.quantity || 0)
                const subtotal = Number(item.subtotal ?? item.price * item.quantity)

                if (!name || qty <= 0) return

                const existing = map.get(name) ?? {
                    product: name,
                    quantity: 0,
                    revenue: 0,
                }

                existing.quantity += qty
                existing.revenue += subtotal

                map.set(name, existing)
            })
        })

        return Array.from(map.values())
            .sort((a, b) => {
                if (b.quantity !== a.quantity) return b.quantity - a.quantity
                return b.revenue - a.revenue
            })
            .slice(0, 7)
    }, [allFilteredTransactions])

    return {
        ...transactionsState,
        chartData,
        timeRange,
        setTimeRange,
        filteredChartData,
        activeBarMetric,
        setActiveBarMetric,
        totals,
        customerDebts,
        paymentStatusData,
        topProducts,
    }
}
