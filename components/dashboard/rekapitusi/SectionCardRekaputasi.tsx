import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { formatCurrency } from "@/lib/format-idr"

type Props = {
    isLoading: boolean
    totalRevenue: number
    totalDebt: number
    completedCount: number
    pendingCount: number
    totalModal: number
    isLoadingModal: boolean
}

export function SectionCardRekaputasi({
    isLoading,
    totalRevenue,
    totalDebt,
    completedCount,
    pendingCount,
    totalModal,
    isLoadingModal,
}: Props) {
    return (
        <div className="mt-2 sm:mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Uang Modal</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-violet-500">
                        {isLoadingModal ? "-" : formatCurrency(totalModal)}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Pendapatan</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-500">
                        {isLoading ? "-" : formatCurrency(totalRevenue)}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Hutang</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-amber-500">
                        {isLoading ? "-" : formatCurrency(totalDebt)}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Transaksi Selesai</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-sky-500">
                        {isLoading ? "-" : completedCount}
                    </div>
                </CardContent>
            </Card>

            <Card className="border-2 shadow-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Transaksi Pending</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-rose-500">
                        {isLoading ? "-" : pendingCount}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

