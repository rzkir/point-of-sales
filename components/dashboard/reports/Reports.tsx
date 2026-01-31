"use client"

import * as React from "react"
import { IconLoader, IconReportMoney, IconEye } from "@tabler/icons-react"

import { useStateLaporan } from "@/services/laporan/useStateLaporan"
import { useStateEditLaporan } from "@/services/laporan/edit/useStateEditLaporan"

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

import { formatRupiah } from "@/lib/format-idr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

const CATEGORY_LABELS: Record<string, string> = {
    operasional: "Operasional",
    listrik: "Listrik",
    air: "Air",
    pembelian: "Pembelian / Stok",
    lainnya: "Lainnya",
}

function statusBadge(status: string) {
    const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
        pending: { label: "Pending", variant: "secondary" },
        approved: { label: "Disetujui", variant: "default" },
        rejected: { label: "Ditolak", variant: "destructive" },
    }
    const cfg = map[status] ?? { label: status, variant: "outline" as const }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export default function Reports() {
    const [statusFilter, setStatusFilter] = React.useState<string>("")
    const [detailsExpense, setDetailsExpense] = React.useState<StoreExpenseRow | null>(null)

    const {
        expenses,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        loadLaporan,
        handlePageChange,
        handleLimitChange,
    } = useStateLaporan(undefined, statusFilter || undefined)

    const { isSubmitting, submittingId, updateStatus } = useStateEditLaporan({ onUpdate: loadLaporan })

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
                                    <IconReportMoney className="size-7" />
                                </div>
                            </div>
                            <div className="space-y-2 flex-1">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                                    <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                        Laporan Pengeluaran
                                    </h1>
                                    {!isLoading && total > 0 && (
                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                            {total} data
                                        </span>
                                    )}
                                </div>
                                <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                    Daftar laporan pengeluaran toko dari karyawan. Setujui atau tolak pengeluaran yang berstatus pending.
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border border-border/60 shadow-sm overflow-hidden rounded-xl p-0">
                <CardContent className="p-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 px-5 py-4 bg-muted/20">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">Filter status:</span>
                            <Select
                                value={statusFilter || "all"}
                                onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Semua status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="approved">Disetujui</SelectItem>
                                    <SelectItem value="rejected">Ditolak</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-0 hover:bg-transparent">
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Tanggal
                                        </TableHead>
                                        <TableHead className="h-12 bg-muted/40 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs">
                                            Kategori
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
                    ) : expenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="rounded-full bg-muted/50 p-4 mb-4">
                                <IconReportMoney className="size-8 text-muted-foreground/60" />
                            </div>
                            <p className="text-muted-foreground font-medium">Belum ada data laporan pengeluaran.</p>
                            <p className="text-sm text-muted-foreground/80 mt-1">
                                Data akan muncul setelah karyawan mengirim laporan pengeluaran.
                            </p>
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
                                                Kategori
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
                                            <TableHead className="h-12 w-[160px] bg-muted/50 px-5 font-semibold text-muted-foreground uppercase tracking-wider text-xs last:rounded-tr-xl">
                                                Aksi
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {expenses.map((exp, idx) => (
                                            <TableRow
                                                key={exp.id}
                                                className={`border-b border-border/50 transition-colors hover:bg-muted/30 ${idx % 2 === 1 ? "bg-muted/20" : "bg-card"}`}
                                            >
                                                <TableCell className="px-5 py-4 font-medium text-foreground">
                                                    {formatDate(exp.date)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-primary/20">
                                                        {CATEGORY_LABELS[exp.category] ?? exp.category}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="px-5 py-4 font-semibold tabular-nums text-foreground">
                                                    {formatRupiah(Number(exp.amount))}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-muted-foreground">
                                                    {exp.cashier_name ?? "—"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 font-medium">
                                                    {exp.branch_name ?? "—"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    {statusBadge(exp.status)}
                                                </TableCell>
                                                <TableCell className="px-5 py-4 text-muted-foreground">
                                                    {exp.approved_by ?? "—"}
                                                </TableCell>
                                                <TableCell className="px-5 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setDetailsExpense(exp)}
                                                            className="h-8 w-8 shrink-0 p-0"
                                                        >
                                                            <IconEye className="size-4" />
                                                            <span className="sr-only">Detail</span>
                                                        </Button>
                                                        <Select
                                                            value={exp.status}
                                                            onValueChange={(value) => {
                                                                if (value === "approved" || value === "rejected") {
                                                                    updateStatus(exp.id, value)
                                                                }
                                                            }}
                                                            disabled={exp.status !== "pending" || isSubmitting}
                                                        >
                                                            <SelectTrigger size="sm" className="w-[120px] min-w-0">
                                                                {submittingId === exp.id ? (
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
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {totalPages > 1 && (
                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 bg-muted/20 px-5 py-4">
                                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
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

            <Dialog open={!!detailsExpense} onOpenChange={(open) => !open && setDetailsExpense(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Detail Pengeluaran</DialogTitle>
                        <DialogDescription>
                            Keterangan dan bukti pengeluaran.
                        </DialogDescription>
                    </DialogHeader>
                    {detailsExpense && (
                        <div className="grid gap-4">
                            <div className="grid gap-2">
                                <Label className="text-muted-foreground">Keterangan</Label>
                                <p className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm">
                                    {detailsExpense.description?.trim() || "—"}
                                </p>
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-muted-foreground">Bukti / Receipt</Label>
                                {detailsExpense.receipt_url ? (
                                    <div className="space-y-2">
                                        {/\.(jpg|jpeg|png|gif|webp)$/i.test(detailsExpense.receipt_url) ? (
                                            <a
                                                href={detailsExpense.receipt_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block rounded-md border overflow-hidden"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={detailsExpense.receipt_url}
                                                    alt="Bukti pengeluaran"
                                                    className="max-h-64 w-full object-contain"
                                                />
                                            </a>
                                        ) : (
                                            <a
                                                href={detailsExpense.receipt_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center text-sm text-primary underline hover:no-underline"
                                            >
                                                Lihat bukti (link)
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <p className="rounded-md border border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                                        Tidak ada bukti
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </section>
    )
}
