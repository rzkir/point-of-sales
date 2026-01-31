"use client"

import * as React from "react"
import { IconLoader, IconPlus } from "@tabler/icons-react"
import { useAuth } from "@/context/AuthContext"
import { useStateCashLog } from "@/services/cashlog/useStateCashLog"
import { useStateCreateCashLog } from "@/services/cashlog/create/useStateCreateCashLog"
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

function typeLabel(type: string) {
    return type === "opening_cash" ? "Kas Buka" : "Kas Tutup"
}

export default function CashLog() {
    const { user } = useAuth()
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

    const {
        isOpen,
        setIsOpen,
        isSubmitting,
        formRef,
        handleSubmit,
        branches,
        isLoadingBranches,
        useLoggedInUser,
    } = useStateCreateCashLog({ onUpdate: loadCashLogs, user })

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr)
            return d.toLocaleDateString("id-ID", { dateStyle: "short" })
        } catch {
            return dateStr
        }
    }

    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Pembekuan Kas</h1>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <IconPlus className="size-4 mr-2" />
                            Bekukan Kas
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Bekukan Kas</DialogTitle>
                            <DialogDescription>
                                Catat kas buka atau kas tutup untuk pembekuan.
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
                            {useLoggedInUser ? (
                                <>
                                    <div className="grid gap-2">
                                        <Label>Nama Kasir</Label>
                                        <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                            {user?.name || user?.email || "-"}
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Cabang</Label>
                                        <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                                            {user?.branchName || "-"}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="cashier_name">Nama Kasir</Label>
                                        <Input
                                            id="cashier_name"
                                            name="cashier_name"
                                            type="text"
                                            placeholder="Nama kasir (opsional)"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="branch_name">Cabang</Label>
                                        <select
                                            id="branch_name"
                                            name="branch_name"
                                            required
                                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="">Pilih cabang</option>
                                            {isLoadingBranches ? (
                                                <option disabled>Memuat...</option>
                                            ) : (
                                                branches.map((b) => (
                                                    <option key={b.id} value={b.name}>
                                                        {b.name}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="type">Tipe</Label>
                                <select
                                    id="type"
                                    name="type"
                                    defaultValue="opening_cash"
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="opening_cash">Kas Buka</option>
                                    <option value="closing_cash">Kas Tutup</option>
                                </select>
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
                                            Menyimpan...
                                        </>
                                    ) : (
                                        "Simpan"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="rounded-md border">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <IconLoader className="size-8 animate-spin text-muted-foreground" />
                    </div>
                ) : cashLogs.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                        Belum ada data pembekuan kas. Klik &quot;Bekukan Kas&quot; untuk menambah.
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Tipe</TableHead>
                                    <TableHead className="text-right">Jumlah</TableHead>
                                    <TableHead>Kasir</TableHead>
                                    <TableHead>Cabang</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {cashLogs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell className="font-medium">
                                            {formatDate(log.date)}
                                        </TableCell>
                                        <TableCell>{typeLabel(log.type)}</TableCell>
                                        <TableCell className="text-right">
                                            {formatRupiah(Number(log.amount))}
                                        </TableCell>
                                        <TableCell>{log.cashier_name || "-"}</TableCell>
                                        <TableCell>{log.branch_name}</TableCell>
                                        <TableCell>{statusBadge(log.status)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {totalPages > 1 && (
                            <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-3">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span>Menampilkan {(page - 1) * limit + 1}-{Math.min(page * limit, total)} dari {total}</span>
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
                                    <span>per halaman</span>
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
        </section>
    )
}
