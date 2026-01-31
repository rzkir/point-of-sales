"use client"

import { IconLoader, IconCashBanknote } from "@tabler/icons-react"

import { useStateCashLog } from "@/services/cashlog/useStateCashLog"

import { useStateEditCashLog } from "@/services/cashlog/edit/useStateEditCashLog"

import { Card, CardContent } from "@/components/ui/card"

import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { AppSkeleton } from "@/components/dashboard/AppSkelaton"

import { formatRupiah, typeLabel } from "@/lib/format-idr"

import { Badge } from "@/components/ui/badge"

function statusBadge(status: string) {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        pending: { label: "Pending", variant: "secondary" },
        approved: { label: "Disetujui", variant: "default" },
        rejected: { label: "Ditolak", variant: "destructive" },
    }
    const cfg = map[status] ?? { label: status, variant: "outline" as const }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export default function CashLogs() {
    const {
        cashLogs,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        loadCashLogs,
        handlePageChange,
        handleLimitChange,
    } = useStateCashLog()

    const { isSubmitting, submittingId, updateStatus } = useStateEditCashLog({ onUpdate: loadCashLogs })

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            return d.toLocaleDateString("id-ID", { dateStyle: "short" })
        } catch {
            return dateStr
        }
    }

    return (
        <section className="space-y-6">
            <Card className="border-2 bg-linear-to-br from-card via-card to-muted/20 shadow-lg overflow-hidden">
                <CardContent>
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-4">
                            <div className="relative">
                                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                                <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-lg ring-2 ring-primary/20">
                                    <IconCashBanknote className="size-7" />
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex items-center gap-3">
                                    <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        Pembekuan Kas
                                    </h1>
                                    {!isLoading && total > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                            {total} data
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Daftar pembekuan kas (kas buka / kas tutup) dari karyawan. Setujui atau tolak pembekuan kas tutup yang berstatus pending.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl p-0">
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-0 hover:bg-transparent">
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Tanggal
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Tipe
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Jumlah
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Kasir
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Cabang
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Status
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Disetujui oleh
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Disetujui pada
                                        </TableHead>
                                        <TableHead className="h-12 w-[160px] bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AppSkeleton rows={5} columns={9} />
                                </TableBody>
                            </Table>
                        </div>
                    ) : cashLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="rounded-full bg-muted/50 p-4 mb-4">
                                <IconCashBanknote className="size-8 text-muted-foreground/60" />
                            </div>
                            <p className="text-muted-foreground font-medium">Belum ada data pembekuan kas.</p>
                            <p className="text-sm text-muted-foreground/80 mt-1">Data akan muncul setelah karyawan melakukan kas buka atau kas tutup.</p>
                        </div>
                    ) : (
                        <>
                            <div className="overflow-hidden rounded-b-xl">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-0 hover:bg-transparent">
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs first:rounded-tl-xl">
                                                Tanggal
                                            </TableHead>
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                                Tipe
                                            </TableHead>
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                                Jumlah
                                            </TableHead>
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                                Kasir
                                            </TableHead>
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                                Cabang
                                            </TableHead>
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                                Status
                                            </TableHead>
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                                Disetujui oleh
                                            </TableHead>
                                            <TableHead className="h-12 bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                                Disetujui pada
                                            </TableHead>
                                            <TableHead className="h-12 w-[160px] bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs last:rounded-tr-xl">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {cashLogs.map((log, idx) => (
                                            <TableRow
                                                key={log.id}
                                                className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${idx % 2 === 1 ? "bg-muted/20" : "bg-card"}`}
                                            >
                                                <TableCell className="px-5 py-4 font-medium text-foreground">
                                                    {formatDate(log.date)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                                                        {typeLabel(log.type)}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 font-semibold tabular-nums text-foreground">
                                                    {formatRupiah(Number(log.amount))}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-muted-foreground">
                                                    {log.cashier_name || "—"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 font-medium">
                                                    {log.branch_name}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    {statusBadge(log.status)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-muted-foreground">
                                                    {log.approved_by || "—"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-muted-foreground">
                                                    {log.approved_at ? formatDate(log.approved_at) : "—"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <Select
                                                        value={log.status}
                                                        onValueChange={(value) => {
                                                            if (value === "approved" || value === "rejected") {
                                                                updateStatus(log.id, value)
                                                            }
                                                        }}
                                                        disabled={log.status !== "pending" || isSubmitting}
                                                    >
                                                        <SelectTrigger size="sm" className="w-[120px] min-w-0">
                                                            {submittingId === log.id ? (
                                                                <span className="flex items-center gap-2">
                                                                    <IconLoader className="size-4 shrink-0 animate-spin" />
                                                                    <span className="truncate">Memproses...</span>
                                                                </span>
                                                            ) : (
                                                                <SelectValue placeholder="Pilih aksi" />
                                                            )}
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending" disabled>
                                                                Pilih aksi
                                                            </SelectItem>
                                                            <SelectItem value="approved">Setujui</SelectItem>
                                                            <SelectItem value="rejected">Tolak</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 bg-muted/20 px-5 py-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>
                                            Menampilkan {(page - 1) * limit + 1}–
                                            {Math.min(page * limit, total)} dari {total}
                                        </span>
                                        <select
                                            value={limit}
                                            onChange={(e) => handleLimitChange(e.target.value)}
                                            className="h-8 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value={5}>5</option>
                                            <option value={10}>10</option>
                                            <option value={20}>20</option>
                                            <option value={50}>50</option>
                                        </select>
                                        per halaman
                                    </div>
                                    <Pagination>
                                        <PaginationContent className="gap-1">
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handlePageChange(page - 1)
                                                    }}
                                                    aria-disabled={!hasPrev}
                                                    className={!hasPrev ? "pointer-events-none opacity-50" : "rounded-lg"}
                                                />
                                            </PaginationItem>
                                            <PaginationItem>
                                                <span className="px-3 py-2 text-sm font-medium">
                                                    Halaman {page} / {totalPages}
                                                </span>
                                            </PaginationItem>
                                            <PaginationItem>
                                                <PaginationNext
                                                    href="#"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        handlePageChange(page + 1)
                                                    }}
                                                    aria-disabled={!hasNext}
                                                    className={!hasNext ? "pointer-events-none opacity-50" : "rounded-lg"}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}
