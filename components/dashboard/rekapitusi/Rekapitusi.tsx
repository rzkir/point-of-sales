"use client"

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { IconChartAreaLine, IconReportMoney } from "@tabler/icons-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

import {
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

import { useStateRekapitusi, chartConfig, topProductsChartConfig } from "@/services/rekapitusi/useStateRekaputasi"

import { SectionCardRekaputasi } from "@/components/dashboard/rekapitusi/SectionCardRekaputasi"

import { formatCurrency } from "@/lib/format-idr"

export default function Rekapitusi() {
    const {
        isLoading,
        totalRevenue,
        totalDebt,
        completedCount,
        pendingCount,
        usersWithDebtCount,
        branchFilter,
        branches,
        isLoadingBranches,
        handleFilterChange,
        timeRange,
        setTimeRange,
        filteredChartData,
        activeBarMetric,
        setActiveBarMetric,
        totals,
        customerDebts,
        topProducts,
    } = useStateRekapitusi()

    return (
        <section className="space-y-8">
            <Card className="border-2 bg-linear-to-br from-card via-card to-muted/20 shadow-lg overflow-hidden">
                <CardContent>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-lg ring-2 ring-primary/20">
                                    <IconReportMoney className="size-7" />
                                </div>
                            </div>
                            <div className="space-y-3 flex-1">
                                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                    Rekapitulasi Transaksi
                                </h1>
                                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Ringkasan performa transaksi toko Anda: pendapatan, status pembayaran, dan hutang
                                    pelanggan dalam satu tampilan.
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                    Angka di bawah ini membantu Anda memahami kesehatan keuangan toko secara cepat: total
                                    pendapatan, hutang yang masih aktif, serta jumlah transaksi yang sudah selesai dan masih
                                    pending.
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 flex w-full items-center justify-between gap-2 sm:mt-0 sm:w-auto sm:justify-end sm:gap-3">
                            <span className="text-xs sm:text-sm text-muted-foreground sm:whitespace-nowrap">
                                Filter cabang
                            </span>
                            <Select
                                value={branchFilter || "ALL"}
                                onValueChange={(value) =>
                                    handleFilterChange({
                                        branch_name: value === "ALL" ? "" : value,
                                    })
                                }
                                disabled={isLoadingBranches}
                            >
                                <SelectTrigger className="w-[150px] sm:w-[220px]">
                                    <SelectValue
                                        placeholder={isLoadingBranches ? "Memuat cabang..." : "Semua cabang"}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Semua cabang</SelectItem>
                                    {branches.map((branch) => (
                                        <SelectItem key={branch.id} value={branch.name || ""}>
                                            {branch.name || "Tanpa nama"}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <SectionCardRekaputasi
                isLoading={isLoading}
                totalRevenue={totalRevenue}
                totalDebt={totalDebt}
                completedCount={completedCount}
                pendingCount={pendingCount}
            />

            <div className="grid gap-4 md:grid-cols-3 items-start">
                <Card className="border-2 shadow-sm md:col-span-2 pt-0">
                    <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
                        <div className="grid flex-1 gap-1">
                            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                                <IconChartAreaLine className="size-5 text-primary" />
                                Tren Pendapatan
                            </CardTitle>
                            <CardDescription>
                                Pergerakan pendapatan dan jumlah transaksi berdasarkan tanggal transaksi.
                            </CardDescription>
                        </div>
                        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "90d" | "30d" | "7d")}>
                            <SelectTrigger
                                className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
                                aria-label="Pilih rentang waktu"
                            >
                                <SelectValue placeholder="3 bulan terakhir" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="90d" className="rounded-lg">
                                    3 bulan terakhir
                                </SelectItem>
                                <SelectItem value="30d" className="rounded-lg">
                                    30 hari terakhir
                                </SelectItem>
                                <SelectItem value="7d" className="rounded-lg">
                                    7 hari terakhir
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="px-2 pt-3 pb-5 sm:px-6 sm:pt-6">
                        {filteredChartData.length === 0 ? (
                            <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
                                Belum ada data transaksi untuk ditampilkan.
                            </div>
                        ) : (
                            <div className="w-full overflow-x-auto">
                                <div className="min-w-[320px]">
                                    <ChartContainer config={chartConfig} className="aspect-auto h-[260px] w-full">
                                        <AreaChart data={filteredChartData}>
                                            <defs>
                                                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="fillTransactions" x1="0" y1="0" x2="0" y2="1">
                                                    <stop
                                                        offset="5%"
                                                        stopColor="var(--color-transactions)"
                                                        stopOpacity={0.8}
                                                    />
                                                    <stop
                                                        offset="95%"
                                                        stopColor="var(--color-transactions)"
                                                        stopOpacity={0.1}
                                                    />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tickMargin={8}
                                                minTickGap={32}
                                                tickFormatter={(value) => {
                                                    const date = new Date(value as string)
                                                    return date.toLocaleDateString("id-ID", {
                                                        day: "2-digit",
                                                        month: "short",
                                                    })
                                                }}
                                            />
                                            <ChartTooltip
                                                cursor={false}
                                                content={
                                                    <ChartTooltipContent
                                                        indicator="dot"
                                                        labelFormatter={(value) =>
                                                            new Date(value as string).toLocaleDateString("id-ID", {
                                                                day: "2-digit",
                                                                month: "short",
                                                                year: "numeric",
                                                            })
                                                        }
                                                    />
                                                }
                                            />
                                            <Area
                                                dataKey="transactions"
                                                type="natural"
                                                fill="url(#fillTransactions)"
                                                stroke="var(--color-transactions)"
                                                stackId="a"
                                            />
                                            <Area
                                                dataKey="revenue"
                                                type="natural"
                                                fill="url(#fillRevenue)"
                                                stroke="var(--color-revenue)"
                                                stackId="a"
                                            />
                                            <ChartLegend content={<ChartLegendContent />} />
                                        </AreaChart>
                                    </ChartContainer>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-2 shadow-sm">
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-lg">Ringkasan Hutang</CardTitle>
                        <CardDescription>
                            Gambaran cepat jumlah pelanggan yang masih memiliki hutang aktif.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 min-h-[300px]">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">User dengan hutang</span>
                            <span className="text-2xl font-bold">{isLoading ? "-" : usersWithDebtCount}</span>
                        </div>
                        <div className="rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
                            Data ini dihitung dari semua transaksi dengan sisa pembayaran (kasbon / partial) yang
                            belum lunas.
                        </div>

                        {isLoading ? (
                            <div className="h-[120px] rounded-md bg-muted/60 animate-pulse" />
                        ) : customerDebts.length === 0 ? (
                            <p className="text-xs text-muted-foreground">Belum ada pelanggan dengan hutang aktif.</p>
                        ) : (
                            <div className="rounded-lg border bg-background/60">
                                <div className="w-full overflow-x-auto">
                                    <Table className="min-w-[340px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Pelanggan</TableHead>
                                                <TableHead className="text-right">Total Hutang</TableHead>
                                                <TableHead className="text-right">Transaksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {customerDebts.slice(0, 5).map((item) => (
                                                <TableRow key={item.customer}>
                                                    <TableCell className="text-xs sm:text-sm">
                                                        {item.customer || "Tanpa nama"}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs sm:text-sm font-medium">
                                                        {formatCurrency(item.totalDebt)}
                                                    </TableCell>
                                                    <TableCell className="text-right text-xs sm:text-sm text-muted-foreground">
                                                        {item.transactions.toLocaleString("id-ID")}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                {customerDebts.length > 5 && (
                                    <p className="px-3 py-2 text-[10px] sm:text-xs text-muted-foreground border-t bg-muted/30">
                                        Menampilkan 5 pelanggan dengan hutang terbesar dari{" "}
                                        {customerDebts.length.toLocaleString("id-ID")} pelanggan yang memiliki hutang.
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border-2 shadow-sm py-0">
                <CardHeader className="flex flex-col items-stretch border-b p-0 sm:flex-row">
                    <div className="flex flex-1 flex-col justify-center gap-1 px-6">
                        <CardTitle>Ringkasan Grafik</CardTitle>
                        <CardDescription>
                            Perbandingan total pendapatan dan jumlah transaksi pada rentang waktu yang dipilih.
                        </CardDescription>
                    </div>
                    <div className="flex">
                        {["revenue", "transactions"].map((key) => {
                            const metric = key as keyof typeof chartConfig
                            const isRevenue = metric === "revenue"
                            const value = totals[metric]

                            return (
                                <button
                                    key={metric}
                                    type="button"
                                    data-active={activeBarMetric === metric}
                                    className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                                    onClick={() => setActiveBarMetric(metric)}
                                >
                                    <span className="text-muted-foreground text-xs">
                                        {chartConfig[metric].label}
                                    </span>
                                    <span className="text-lg leading-none font-bold sm:text-3xl">
                                        {isRevenue ? formatCurrency(value) : value.toLocaleString("id-ID")}
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                </CardHeader>
                <CardContent className="px-1 sm:p-6">
                    {filteredChartData.length === 0 ? (
                        <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                            Belum ada data transaksi untuk ditampilkan.
                        </div>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <div className="min-w-[320px] max-w-4xl mx-auto">
                                <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
                                    <BarChart
                                        accessibilityLayer
                                        data={filteredChartData}
                                        margin={{
                                            left: 12,
                                            right: 12,
                                        }}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickLine={false}
                                            axisLine={false}
                                            tickMargin={8}
                                            minTickGap={24}
                                            tickFormatter={(value) => {
                                                const date = new Date(value as string)
                                                return date.toLocaleDateString("id-ID", {
                                                    day: "2-digit",
                                                    month: "short",
                                                })
                                            }}
                                        />
                                        <ChartTooltip
                                            cursor={false}
                                            content={
                                                <ChartTooltipContent
                                                    className="w-[160px]"
                                                    indicator="dot"
                                                    labelFormatter={(value) =>
                                                        new Date(value as string).toLocaleDateString("id-ID", {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        })
                                                    }
                                                    formatter={(value) => [
                                                        activeBarMetric === "revenue"
                                                            ? new Intl.NumberFormat("id-ID", {
                                                                style: "currency",
                                                                currency: "IDR",
                                                                maximumFractionDigits: 0,
                                                            }).format(Number(value))
                                                            : Number(value).toLocaleString("id-ID"),
                                                        chartConfig[activeBarMetric].label,
                                                    ]}
                                                />
                                            }
                                        />
                                        <Bar dataKey={activeBarMetric} fill={`var(--color-${activeBarMetric})`} />
                                    </BarChart>
                                </ChartContainer>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">Produk Terlaris</CardTitle>
                    <CardDescription>
                        Daftar produk dengan jumlah penjualan terbanyak pada rentang data yang sedang ditampilkan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-2 sm:px-6 sm:pt-4">
                    {isLoading ? (
                        <div className="h-[260px] w-full rounded-md bg-muted/60 animate-pulse" />
                    ) : topProducts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Belum ada data produk terjual untuk ditampilkan.</p>
                    ) : (
                        <div className="w-full overflow-x-auto">
                            <ChartContainer
                                config={topProductsChartConfig}
                                className="aspect-auto h-[260px] w-full"
                            >
                                <BarChart
                                    data={topProducts}
                                    layout="vertical"
                                    margin={{
                                        left: 64,
                                        right: 16,
                                    }}
                                >
                                    <CartesianGrid horizontal vertical={false} strokeDasharray="3 3" />
                                    <XAxis type="number" />
                                    <YAxis
                                        dataKey="product"
                                        type="category"
                                        tickLine={false}
                                        axisLine={false}
                                        width={120}
                                    />
                                    <ChartTooltip
                                        cursor={false}
                                        content={
                                            <ChartTooltipContent
                                                className="w-[220px]"
                                                indicator="dot"
                                                formatter={(value, name, props) => {
                                                    const payload = props?.payload as
                                                        | { product?: string; revenue?: number }
                                                        | undefined

                                                    const productName = payload?.product ?? ""
                                                    const revenue = payload?.revenue ?? 0

                                                    const qtyLabel = "Jumlah terjual"
                                                    const qtyValue = Number(value).toLocaleString("id-ID")
                                                    const revenueValue = formatCurrency(revenue)

                                                    return [
                                                        `${qtyValue} (${revenueValue})`,
                                                        productName || qtyLabel,
                                                    ]
                                                }}
                                            />
                                        }
                                    />
                                    <Bar dataKey="quantity" fill="#f97316" radius={[4, 4, 4, 4]} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}