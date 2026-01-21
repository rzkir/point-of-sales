 "use client"

 import * as React from "react"
 import Link from "next/link"
 import { IconDotsVertical, IconPackage, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react"
 import { toast } from "sonner"
 import {
     flexRender,
     getCoreRowModel,
     getFilteredRowModel,
     getPaginationRowModel,
     getSortedRowModel,
     useReactTable,
     type ColumnDef,
     type ColumnFiltersState,
     type SortingState,
 } from "@tanstack/react-table"

 import { Badge } from "@/components/ui/badge"
 import { Button } from "@/components/ui/button"
 import { Card, CardContent, CardHeader } from "@/components/ui/card"
 import {
     DropdownMenu,
     DropdownMenuContent,
     DropdownMenuItem,
     DropdownMenuSeparator,
     DropdownMenuTrigger,
 } from "@/components/ui/dropdown-menu"
 import { Input } from "@/components/ui/input"
 import {
     Table,
     TableBody,
     TableCell,
     TableHead,
     TableHeader,
     TableRow,
 } from "@/components/ui/table"
 import { AppSkeleton, CardSkeleton } from "../AppSkelaton"

 type ProductRow = {
     id: string | number
     uid?: string
     name: string
     price?: number
     modal?: number
     stock?: number
     sold?: number
     unit?: string
     barcode?: string
     is_active?: boolean
     branch_id?: string
     image_url?: string
 }

 const formatCurrency = (value?: number) => {
     const n = Number(value ?? 0)
     if (Number.isNaN(n)) return "-"
     return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)
 }

 const createColumns = (onUpdate: () => void): ColumnDef<ProductRow>[] => [
     {
         accessorKey: "name",
         header: () => <span className="font-semibold">Name</span>,
         cell: ({ row }) => (
             <div className="flex items-center gap-3">
                 <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                     <IconPackage className="size-5" />
                 </div>
                 <div className="min-w-0">
                     <div className="font-semibold text-foreground truncate">{row.getValue("name")}</div>
                     <div className="text-xs text-muted-foreground truncate">
                         {row.original.barcode ? `Barcode: ${row.original.barcode}` : "No barcode"}
                     </div>
                 </div>
             </div>
         ),
     },
     {
         accessorKey: "price",
         header: () => <span className="font-semibold">Price</span>,
         cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatCurrency(row.getValue("price"))}</span>,
     },
     {
         accessorKey: "stock",
         header: () => <span className="font-semibold">Stock</span>,
         cell: ({ row }) => <span className="text-sm text-muted-foreground">{String(row.getValue("stock") ?? 0)}</span>,
     },
     {
         accessorKey: "is_active",
         header: () => <span className="font-semibold">Status</span>,
         cell: ({ row }) => {
             const isActive = Boolean(row.getValue("is_active"))
             return (
                 <Badge className={isActive ? "bg-green-500/10 text-green-700 dark:text-green-400" : "bg-red-500/10 text-red-700 dark:text-red-400"}>
                     {isActive ? "Active" : "Inactive"}
                 </Badge>
             )
         },
     },
     {
         id: "actions",
         header: () => <span className="font-semibold">Actions</span>,
         cell: ({ row }) => <ProductActions product={row.original} onUpdate={onUpdate} />,
     },
 ]

 function ProductActions({ product, onUpdate }: { product: ProductRow; onUpdate: () => void }) {
     const isDeletingRef = React.useRef(false)

     const handleDelete = async () => {
         if (isDeletingRef.current) return
         isDeletingRef.current = true
         try {
             const response = await fetch(`/api/products/${encodeURIComponent(String(product.id))}`, {
                 method: "DELETE",
             })
             const data = await response.json().catch(() => ({}))

             if (!response.ok || !data?.success) {
                 throw new Error(data?.message || "Failed to delete product")
             }

             toast.success("Product deleted")
             onUpdate()
         } catch (error) {
             console.error("Delete product error:", error)
             toast.error(error instanceof Error ? error.message : "Failed to delete product")
         } finally {
             isDeletingRef.current = false
         }
     }

     return (
         <DropdownMenu>
             <DropdownMenuTrigger asChild>
                 <Button
                     variant="ghost"
                     className="data-[state=open]:bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 flex size-9 transition-colors"
                     size="icon"
                 >
                     <IconDotsVertical className="size-4" />
                     <span className="sr-only">Open menu</span>
                 </Button>
             </DropdownMenuTrigger>
             <DropdownMenuContent align="end" className="w-44">
                 <DropdownMenuItem asChild className="cursor-pointer">
                     <Link href={`/dashboard/products/edit?id=${encodeURIComponent(String(product.id))}`}>
                         <IconPencil className="mr-2 size-4" />
                         Edit
                     </Link>
                 </DropdownMenuItem>
                 <DropdownMenuSeparator />
                 <DropdownMenuItem
                     variant="destructive"
                     onSelect={(e) => {
                         e.preventDefault()
                         void handleDelete()
                     }}
                     className="cursor-pointer text-destructive focus:text-destructive"
                 >
                     <IconTrash className="mr-2 size-4" />
                     Delete
                 </DropdownMenuItem>
             </DropdownMenuContent>
         </DropdownMenu>
     )
 }

 export default function Products() {
     const [products, setProducts] = React.useState<ProductRow[]>([])
     const [isLoading, setIsLoading] = React.useState(true)
     const [sorting, setSorting] = React.useState<SortingState>([])
     const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

     const fetchProducts = React.useCallback(async () => {
         try {
             setIsLoading(true)
             const response = await fetch("/api/products")
             const data = await response.json()

             if (!data.success) {
                 throw new Error(data.message || "Failed to fetch products")
             }

             setProducts(data.data || [])
         } catch (error) {
             console.error("Fetch products error:", error)
             toast.error(error instanceof Error ? error.message : "Failed to fetch products")
         } finally {
             setIsLoading(false)
         }
     }, [])

     React.useEffect(() => {
         fetchProducts()
     }, [fetchProducts])

     const columns = React.useMemo(() => createColumns(fetchProducts), [fetchProducts])

     const table = useReactTable({
         data: products,
         columns,
         state: {
             sorting,
             columnFilters,
         },
         onSortingChange: setSorting,
         onColumnFiltersChange: setColumnFilters,
         getCoreRowModel: getCoreRowModel(),
         getFilteredRowModel: getFilteredRowModel(),
         getPaginationRowModel: getPaginationRowModel(),
         getSortedRowModel: getSortedRowModel(),
     })

     const activeCount = products.filter((p) => p.is_active).length

     return (
         <section className="space-y-6">
             <Card className="border-2 bg-linear-to-br from-card via-card to-muted/20 shadow-lg overflow-hidden">
                 <CardContent>
                     <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                         <div className="flex items-start gap-4">
                             <div className="relative">
                                 <div className="absolute inset-0 bg-primary/20 blur-xl rounded-2xl" />
                                 <div className="relative flex size-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/10 text-primary shadow-lg ring-2 ring-primary/20">
                                     <IconPackage className="size-7" />
                                 </div>
                             </div>
                             <div className="space-y-2 flex-1">
                                 <div className="flex items-center gap-3">
                                     <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                         Products
                                     </h1>
                                     {!isLoading && products.length > 0 && (
                                         <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/20">
                                             {products.length} {products.length === 1 ? "product" : "products"}
                                         </span>
                                     )}
                                 </div>
                                 <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                                     Manage your product catalog. Create, edit, and organize all your items in one place.
                                 </p>
                             </div>
                         </div>
                         <div className="shrink-0 flex items-center gap-2">
                             <Button asChild>
                                 <Link href="/dashboard/products/create">
                                     <IconPlus className="mr-2 size-4" />
                                     Add Product
                                 </Link>
                             </Button>
                         </div>
                     </div>
                 </CardContent>
             </Card>

             <div className="grid gap-4 md:grid-cols-3">
                 {isLoading ? (
                     <CardSkeleton count={3} />
                 ) : (
                     <>
                         <Card className="border-2">
                             <CardHeader className="pb-3">
                                 <div className="flex items-center justify-between">
                                     <span className="text-sm font-medium text-muted-foreground">Total Products</span>
                                     <IconPackage className="size-4 text-muted-foreground" />
                                 </div>
                             </CardHeader>
                             <CardContent>
                                 <div className="text-2xl font-bold">{products.length}</div>
                             </CardContent>
                         </Card>
                         <Card className="border-2">
                             <CardHeader className="pb-3">
                                 <div className="flex items-center justify-between">
                                     <span className="text-sm font-medium text-muted-foreground">Active Products</span>
                                     <div className="size-2 rounded-full bg-green-500" />
                                 </div>
                             </CardHeader>
                             <CardContent>
                                 <div className="text-2xl font-bold">{activeCount}</div>
                             </CardContent>
                         </Card>
                         <Card className="border-2">
                             <CardHeader className="pb-3">
                                 <div className="flex items-center justify-between">
                                     <span className="text-sm font-medium text-muted-foreground">Displayed</span>
                                     <IconPackage className="size-4 text-muted-foreground" />
                                 </div>
                             </CardHeader>
                             <CardContent>
                                 <div className="text-2xl font-bold">{table.getRowModel().rows.length}</div>
                             </CardContent>
                         </Card>
                     </>
                 )}
             </div>

             <Card className="border-2">
                 <CardHeader className="pb-3">
                     <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                         <div className="max-w-sm">
                             <Input
                                 placeholder="Search product name..."
                                 value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                                 onChange={(event) => table.getColumn("name")?.setFilterValue(event.target.value)}
                             />
                         </div>
                         <Button variant="outline" onClick={() => fetchProducts()}>
                             Refresh
                         </Button>
                     </div>
                 </CardHeader>
                 <CardContent className="p-0">
                     <div className="overflow-hidden">
                         <Table>
                             <TableHeader>
                                 {table.getHeaderGroups().map((headerGroup) => (
                                     <TableRow key={headerGroup.id} className="border-b-2">
                                         {headerGroup.headers.map((header) => (
                                             <TableHead key={header.id} className="h-12 px-6">
                                                 {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                             </TableHead>
                                         ))}
                                     </TableRow>
                                 ))}
                             </TableHeader>
                             <TableBody>
                                 {isLoading ? (
                                     <AppSkeleton rows={5} />
                                 ) : table.getRowModel().rows?.length ? (
                                     table.getRowModel().rows.map((row) => (
                                         <TableRow key={row.id} className="border-b transition-colors hover:bg-muted/50">
                                             {row.getVisibleCells().map((cell) => (
                                                 <TableCell key={cell.id} className="px-6 py-4">
                                                     {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                 </TableCell>
                                             ))}
                                         </TableRow>
                                     ))
                                 ) : (
                                     <TableRow>
                                         <TableCell colSpan={table.getAllColumns().length} className="h-64 text-center">
                                             <div className="flex flex-col items-center justify-center gap-4 py-8">
                                                 <div className="flex size-16 items-center justify-center rounded-full bg-muted">
                                                     <IconPackage className="size-8 text-muted-foreground" />
                                                 </div>
                                                 <div className="space-y-2">
                                                     <h3 className="text-lg font-semibold">No products found</h3>
                                                     <p className="text-sm text-muted-foreground max-w-sm">
                                                         Get started by creating your first product
                                                     </p>
                                                 </div>
                                                 <Button asChild>
                                                     <Link href="/dashboard/products/create">
                                                         <IconPlus className="mr-2 size-4" />
                                                         Add Product
                                                     </Link>
                                                 </Button>
                                             </div>
                                         </TableCell>
                                     </TableRow>
                                 )}
                             </TableBody>
                         </Table>
                     </div>
                 </CardContent>
             </Card>

             {!isLoading && products.length > 0 && (
                 <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
                     <div className="text-sm text-muted-foreground">
                         Showing <span className="font-semibold text-foreground">{table.getRowModel().rows.length}</span> of{" "}
                         <span className="font-semibold text-foreground">{products.length}</span> product{products.length !== 1 ? "s" : ""}
                     </div>
                 </div>
             )}
         </section>
     )
 }
