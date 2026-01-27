"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { TableRow, TableCell } from "@/components/ui/table"

interface AppSkeletonProps {
    rows?: number
    /** Jumlah kolom. Jika di-set, skeleton disinkronkan dengan struktur tabel (rows = baris per halaman, columns = kolom tabel). */
    columns?: number
}

export function AppSkeleton({ rows = 5, columns }: AppSkeletonProps) {
    const colCount = columns ?? 4

    return (
        <>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <TableRow key={rowIndex} className="hover:bg-transparent">
                    {Array.from({ length: colCount }).map((_, colIndex) => (
                        <TableCell key={colIndex} className="px-6 py-4">
                            {columns !== undefined ? (
                                colIndex === 0 ? (
                                    <div className="flex items-center gap-3">
                                        <Skeleton className="size-10 shrink-0 rounded-lg" />
                                        <Skeleton className="h-5 w-32" />
                                    </div>
                                ) : colIndex === colCount - 1 ? (
                                    <Skeleton className="h-9 w-24 rounded-md" />
                                ) : (
                                    <Skeleton className="h-5 w-24" />
                                )
                            ) : (
                                <>
                                    {colIndex === 0 && (
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="size-10 rounded-lg" />
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                    )}
                                    {colIndex === 1 && (
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="size-4 rounded" />
                                            <Skeleton className="h-5 w-48" />
                                        </div>
                                    )}
                                    {colIndex === 2 && (
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="size-4 rounded" />
                                            <Skeleton className="h-5 w-24" />
                                        </div>
                                    )}
                                    {colIndex === 3 && (
                                        <Skeleton className="size-9 rounded-md" />
                                    )}
                                </>
                            )}
                        </TableCell>
                    ))}
                </TableRow>
            ))}
        </>
    )
}

interface CardSkeletonProps {
    count?: number
}

export function CardSkeleton({ count = 3 }: CardSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, index) => (
                <Card key={index} className="border-2">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="size-4 rounded" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-16" />
                    </CardContent>
                </Card>
            ))}
        </>
    )
}
