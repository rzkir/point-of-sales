"use client"

import * as React from "react"
import { IconX } from "@tabler/icons-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

interface BottomSheetsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    // Filters
    statusFilter: string
    paymentStatusFilter: string
    branchFilter: string
    setStatusFilter: (value: string) => void
    setPaymentStatusFilter: (value: string) => void
    setBranchFilter: (value: string) => void
    // Branch data
    branches: Array<{ id: string; name: string }>
    isLoadingBranches: boolean
    // Check if any filter is active
}

export function TransactionFiltersSheet({
    open,
    onOpenChange,
    statusFilter,
    paymentStatusFilter,
    branchFilter,
    setStatusFilter,
    setPaymentStatusFilter,
    setBranchFilter,
    branches,
    isLoadingBranches,
}: BottomSheetsProps) {
    // Local state for temporary filters (like searchInput for search)
    const [tempStatusFilter, setTempStatusFilter] = React.useState(statusFilter)
    const [tempPaymentStatusFilter, setTempPaymentStatusFilter] = React.useState(paymentStatusFilter)
    const [tempBranchFilter, setTempBranchFilter] = React.useState(branchFilter)

    // Sync local state with props when sheet opens
    React.useEffect(() => {
        if (open) {
            setTempStatusFilter(statusFilter)
            setTempPaymentStatusFilter(paymentStatusFilter)
            setTempBranchFilter(branchFilter)
        }
    }, [open, statusFilter, paymentStatusFilter, branchFilter])

    // Check if any temporary filter is active
    const hasTempActiveFilters = !!(tempStatusFilter || tempPaymentStatusFilter || tempBranchFilter)

    // Handle apply filters
    const handleApplyFilters = () => {
        setStatusFilter(tempStatusFilter)
        setPaymentStatusFilter(tempPaymentStatusFilter)
        setBranchFilter(tempBranchFilter)
        onOpenChange(false)
    }

    // Handle clear filters (only clear local state)
    const handleClearFilters = () => {
        setTempStatusFilter("")
        setTempPaymentStatusFilter("")
        setTempBranchFilter("")
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[400px] sm:w-[500px] p-4">
                <SheetHeader>
                    <SheetTitle>Filter Transactions</SheetTitle>
                    <SheetDescription>
                        Filter your transactions by status, payment status, or branch.
                    </SheetDescription>
                </SheetHeader>

                <div className="mt-6 space-y-6 overflow-y-auto">
                    {/* Filters */}
                    <div className="flex flex-col space-y-10">
                        {/* Status Filter */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={!tempStatusFilter ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempStatusFilter("")}
                                >
                                    All Status
                                </Button>
                                <Button
                                    variant={tempStatusFilter === "pending" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempStatusFilter("pending")}
                                >
                                    Pending
                                </Button>
                                <Button
                                    variant={tempStatusFilter === "completed" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempStatusFilter("completed")}
                                >
                                    Completed
                                </Button>
                                <Button
                                    variant={tempStatusFilter === "cancelled" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempStatusFilter("cancelled")}
                                >
                                    Cancelled
                                </Button>
                                <Button
                                    variant={tempStatusFilter === "return" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempStatusFilter("return")}
                                >
                                    Return
                                </Button>
                            </div>
                        </div>

                        {/* Payment Status Filter */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Payment Status</label>
                            <div className="flex flex-wrap gap-2">
                                <Button
                                    variant={!tempPaymentStatusFilter ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempPaymentStatusFilter("")}
                                >
                                    All Payment Status
                                </Button>
                                <Button
                                    variant={tempPaymentStatusFilter === "paid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempPaymentStatusFilter("paid")}
                                >
                                    Paid
                                </Button>
                                <Button
                                    variant={tempPaymentStatusFilter === "unpaid" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempPaymentStatusFilter("unpaid")}
                                >
                                    Unpaid
                                </Button>
                                <Button
                                    variant={tempPaymentStatusFilter === "partial" ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setTempPaymentStatusFilter("partial")}
                                >
                                    Partial
                                </Button>
                            </div>
                        </div>

                        {/* Branch Filter */}
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium">Branch</label>
                            {isLoadingBranches ? (
                                <div className="text-sm text-muted-foreground">Loading branches...</div>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    <Button
                                        variant={!tempBranchFilter ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setTempBranchFilter("")}
                                    >
                                        All Branches
                                    </Button>
                                    {branches.map((branch) => (
                                        <Button
                                            key={branch.id}
                                            variant={tempBranchFilter === branch.name ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setTempBranchFilter(branch.name)}
                                        >
                                            {branch.name}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" onClick={handleClearFilters} disabled={!hasTempActiveFilters}>
                            <IconX className="mr-2 size-4" />
                            Clear Filters
                        </Button>
                        <Button onClick={handleApplyFilters}>
                            Apply Filters
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
