"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { Card, CardContent, CardHeader } from "@/components/ui/card"

import { TableRow, TableCell } from "@/components/ui/table"

interface AppSkeletonProps {
    rows?: number
}

export function AppSkeleton({ rows = 5 }: AppSkeletonProps) {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                    <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="size-10 rounded-lg" />
                            <Skeleton className="h-5 w-32" />
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-4 rounded" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="size-4 rounded" />
                            <Skeleton className="h-5 w-24" />
                        </div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                        <Skeleton className="size-9 rounded-md" />
                    </TableCell>
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
