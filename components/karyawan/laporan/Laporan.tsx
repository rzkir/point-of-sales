"use client"

import * as React from "react"
import { IconLoader, IconPlus, IconEye } from "@tabler/icons-react"
import { useAuth } from "@/context/AuthContext"
import { useStateLaporan } from "@/services/laporan/useStateLaporan"
import { useStateCreateLaporan } from "@/services/laporan/create/useStateCreateLaporan"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const CATEGORY_LABELS: Record<string, string> = {
    operasional: "Operasional",
    listrik: "Listrik",
    air: "Air",
    pembelian: "Pembelian / Stok",
    lainnya: "Lainnya",
}

function formatRupiah(value: number): string {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value)
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

export default function Laporan() {
    const { user } = useAuth()
    const branchName = user?.branchName

    const {
        expenses,
        isLoading,
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
        uploadReceipt,
        loadLaporan,
        handlePageChange,
        handleLimitChange,
    } = useStateLaporan(branchName)

    const [isOpen, setIsOpen] = React.useState(false)
    const [detailsExpense, setDetailsExpense] = React.useState<StoreExpenseRow | null>(null)
    const formRef = React.useRef<HTMLFormElement>(null)
    const receiptInputRef = React.useRef<HTMLInputElement>(null)

    const { createLaporan, isSubmitting } = useStateCreateLaporan(branchName, {
        uploadReceipt,
        onSuccess: () => {
            setIsOpen(false)
            formRef.current?.reset()
            if (receiptInputRef.current) receiptInputRef.current.value = ""
            loadLaporan()
        },
    })

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            return d.toLocaleDateString("id-ID", { dateStyle: "short" })
        } catch {
            return dateStr
        }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const date = formData.get("date") as string
        const category = (formData.get("category") as StoreExpense["category"]) || "lainnya"
        const amount = formData.get("amount") as string
        const description = (formData.get("description") as string) || ""
        createLaporan({
            date,
            category,
            amount: Number(amount),
            description: description || undefined,
            receiptFile: receiptInputRef.current?.files?.[0],
        })
    }

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Laporan Pengeluaran</h1>
                {branchName && (
                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <IconPlus className="size-4 mr-2" />
                                Tambah Pengeluaran
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Tambah Pengeluaran</DialogTitle>
                                <DialogDescription>
                                    Catat pengeluaran toko (operasional, listrik, air, pembelian, dll).
                                </DialogDescription>
                            </DialogHeader>
                            <form ref={formRef} onSubmit={handleSubmit} className="grid gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="date">Tanggal</Label>
                                    <Input
                                        id="date"
                                        name="date"
                                        type="date"
                                        required
                                        defaultValue={new Date().toISOString().slice(0, 10)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="category">Kategori</Label>
                                    <select
                                        id="category"
                                        name="category"
                                        defaultValue="lainnya"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    >
                                        {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                            <option key={value} value={value}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="amount">Jumlah (Rp)</Label>
                                    <Input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        min={0}
                                        step={1}
                                        required
                                        placeholder="0"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Keterangan</Label>
                                    <Input id="description" name="description" type="text" placeholder="Contoh: Listrik Januari" />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="receipt">Bukti / Receipt (opsional)</Label>
                                    <Input
                                        id="receipt"
                                        ref={receiptInputRef}
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="cursor-pointer file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground file:text-sm"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Nama Kasir</Label>
                                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                        {user?.name || user?.email || "-"}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Cabang</Label>
                                    <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                        {branchName}
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsOpen(false)}
                                        disabled={isSubmitting}
                                    >
                                        Batal
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <IconLoader className="size-4 mr-2 animate-spin" />
                                                Mengirim...
                                            </>
                                        ) : (
                                            "Kirim"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="rounded-md border">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <IconLoader className="size-8 animate-spin text-muted-foreground" />
                    </div>
                ) : expenses.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Belum ada laporan pengeluaran. {branchName ? 'Klik "Tambah Pengeluaran" untuk menambah.' : "Pastikan akun Anda punya cabang."}
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead>Kasir</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[80px]">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.map((exp) => (
                                    <TableRow key={exp.id}>
                                        <TableCell className="font-medium">{formatDate(exp.date)}</TableCell>
                                        <TableCell>{CATEGORY_LABELS[exp.category] ?? exp.category}</TableCell>
                                        <TableCell className="text-right">
                                            {formatRupiah(Number(exp.amount))}
                                        </TableCell>
                                        <TableCell>{exp.cashier_name ?? "-"}</TableCell>
                                        <TableCell>{statusBadge(exp.status)}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setDetailsExpense(exp)}
                                                className="h-8 px-2"
                                            >
                                                <IconEye className="size-4" />
                                                <span className="sr-only">Detail</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>
                                        Menampilkan {(page - 1) * limit + 1}–{Math.min(page * limit, total)} dari {total}
                                    </span>
                                    <select
                                        value={limit}
                                        onChange={(e) => handleLimitChange(e.target.value)}
                                        className="h-8 rounded-md border bg-background px-2 text-sm"
                                    >
                                        <option value={5}>5</option>
                                        <option value={10}>10</option>
                                        <option value={20}>20</option>
                                        <option value={50}>50</option>
                                    </select>
                                    per halaman
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page - 1)}
                                        disabled={!hasPrev}
                                    >
                                        Sebelumnya
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(page + 1)}
                                        disabled={!hasNext}
                                    >
                                        Selanjutnya
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

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
                                    {detailsExpense.description?.trim() || "-"}
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
