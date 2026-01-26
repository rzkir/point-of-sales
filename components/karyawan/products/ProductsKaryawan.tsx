"use client"

import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { IconPackage, IconRefresh, IconSearch, IconPlus, IconMinus, IconLoader, IconCash, IconEdit } from "@tabler/icons-react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { fetchKaryawanProducts, API_CONFIG } from "@/lib/config"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
        },
    },
})

interface CartItem {
    product_id: string
    product_name: string
    price: number
    quantity: number
    image_url?: string
    unit?: string
}

function ProductsKaryawanContent() {
    const { user } = useAuth()
    const branchName = user?.branchName || "Langgeng Jaya 1"
    const page = 1
    const [limit] = useState(100)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [quantities, setQuantities] = useState<Record<string, number>>({})
    const [cartItems, setCartItems] = useState<CartItem[]>([])
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isQuantityDialogOpen, setIsQuantityDialogOpen] = useState(false)
    const [selectedProductForQuantity, setSelectedProductForQuantity] = useState<{ id: string; name: string; unit?: string } | null>(null)
    const [customQuantity, setCustomQuantity] = useState("")
    const [formData, setFormData] = useState({
        customer_name: "",
        discount: 0,
        is_credit: false,
        paid_amount: 0,
    })

    const {
        data,
        isLoading: isLoadingProducts,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ["karyawan-products", branchName, page, limit],
        queryFn: () => fetchKaryawanProducts(branchName, page, limit),
        retry: 1,
    })

    // Get unique categories from products
    const categories = useMemo(() => {
        const allProducts = data?.data || []
        const uniqueCategories = Array.from(
            new Set(allProducts.map((p) => p.category_name).filter(Boolean))
        )
        return uniqueCategories.map((cat) => ({
            name: cat as string,
            count: allProducts.filter((p) => p.category_name === cat).length,
        }))
    }, [data?.data])

    // Filter products by category and search
    const filteredProducts = useMemo(() => {
        const allProducts = data?.data || []
        let filtered = allProducts

        if (selectedCategory) {
            filtered = filtered.filter((p) => p.category_name === selectedCategory)
        }

        if (searchQuery.trim()) {
            const query = searchQuery.trim().toLowerCase()
            filtered = filtered.filter((product) => {
                const name = String(product.name || "").toLowerCase()
                const category = String(product.category_name || "").toLowerCase()
                const barcode = String(product.barcode || "").toLowerCase()
                return name.includes(query) || category.includes(query) || barcode.includes(query)
            })
        }

        return filtered
    }, [data?.data, selectedCategory, searchQuery])

    // Handle quantity change
    const handleQuantityChange = (productId: string, change: number) => {
        setQuantities((prev) => {
            const newQty = Math.max(0, (prev[productId] || 0) + change)
            const newQuantities = { ...prev, [productId]: newQty }

            // Update cart items
            if (newQty === 0) {
                setCartItems((prev) => prev.filter((item) => item.product_id !== productId))
            } else {
                const product = filteredProducts.find((p) => String(p.id) === productId)
                if (product) {
                    setCartItems((prev) => {
                        const existingItem = prev.find((item) => item.product_id === productId)
                        if (existingItem) {
                            return prev.map((item) =>
                                item.product_id === productId
                                    ? { ...item, quantity: newQty }
                                    : item
                            )
                        } else {
                            return [
                                ...prev,
                                {
                                    product_id: String(product.id),
                                    product_name: product.name,
                                    price: product.price,
                                    quantity: newQty,
                                    image_url: product.image_url,
                                    unit: product.unit,
                                },
                            ]
                        }
                    })
                }
            }

            return newQuantities
        })
    }

    // Handle open quantity dialog for custom input
    const handleOpenQuantityDialog = (product: { id: string; name: string; unit?: string }) => {
        setSelectedProductForQuantity(product)
        setCustomQuantity(String(quantities[product.id] || ""))
        setIsQuantityDialogOpen(true)
    }

    // Handle custom quantity submit
    const handleCustomQuantitySubmit = () => {
        if (!selectedProductForQuantity) return

        const qty = parseFloat(customQuantity)
        if (isNaN(qty) || qty < 0) {
            toast.error("Jumlah tidak valid")
            return
        }

        const productId = selectedProductForQuantity.id
        setQuantities((prev) => {
            const newQuantities = { ...prev, [productId]: qty }

            // Update cart items
            if (qty === 0) {
                setCartItems((prev) => prev.filter((item) => item.product_id !== productId))
            } else {
                const product = filteredProducts.find((p) => String(p.id) === productId)
                if (product) {
                    setCartItems((prev) => {
                        const existingItem = prev.find((item) => item.product_id === productId)
                        if (existingItem) {
                            return prev.map((item) =>
                                item.product_id === productId
                                    ? { ...item, quantity: qty }
                                    : item
                            )
                        } else {
                            return [
                                ...prev,
                                {
                                    product_id: String(product.id),
                                    product_name: product.name,
                                    price: product.price,
                                    quantity: qty,
                                    image_url: product.image_url,
                                    unit: product.unit,
                                },
                            ]
                        }
                    })
                }
            }

            return newQuantities
        })

        setIsQuantityDialogOpen(false)
        setSelectedProductForQuantity(null)
        setCustomQuantity("")
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discountAmount = Number(formData.discount) || 0
    const subtotalAfterDiscount = Math.max(0, subtotal - discountAmount)
    const total = subtotalAfterDiscount

    // Calculate paid_amount: if not credit, paid = total; if credit, use form value
    const paidAmount = formData.is_credit
        ? Math.min(Number(formData.paid_amount) || 0, total)
        : total
    const dueAmount = Math.max(0, total - paidAmount)

    const handlePlaceOrder = () => {
        if (cartItems.length === 0) {
            toast.error("Keranjang kosong")
            return
        }
        // Reset form data dan set paid_amount = total (untuk non-credit)
        const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
        const currentDiscount = Number(formData.discount) || 0
        const currentSubtotalAfterDiscount = Math.max(0, currentSubtotal - currentDiscount)
        const currentTotal = currentSubtotalAfterDiscount

        setFormData((prev) => ({
            ...prev,
            is_credit: false,
            paid_amount: currentTotal,
        }))
        setIsDialogOpen(true)
    }

    const handleSubmitTransaction = async (e: React.FormEvent) => {
        e.preventDefault()

        // Validasi: jika kasbon, customer_name wajib
        if (formData.is_credit && !formData.customer_name?.trim()) {
            toast.error("Nama pelanggan wajib untuk transaksi kasbon")
            return
        }

        setIsLoading(true)

        try {
            const items = cartItems.map((item) => ({
                product_id: item.product_id,
                product_name: item.product_name,
                quantity: item.quantity,
                price: item.price,
                subtotal: item.price * item.quantity,
            }))

            const response = await fetch(API_CONFIG.ENDPOINTS.transactions.base, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                body: JSON.stringify({
                    customer_name: formData.customer_name || "",
                    subtotal: subtotalAfterDiscount,
                    tax: 0,
                    total: total,
                    discount: discountAmount,
                    paid_amount: paidAmount,
                    is_credit: formData.is_credit,
                    branch_name: branchName,
                    payment_method: "cash",
                    status: formData.is_credit ? "pending" : "completed",
                    items,
                }),
            })

            const data = await response.json()

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Gagal membuat transaksi")
            }

            toast.success("Pesanan berhasil dibuat!", {
                description: `Nomor transaksi: ${data.data?.transaction_number || "N/A"}`,
            })

            // Reset cart and form
            setCartItems([])
            setQuantities({})
            setFormData({
                customer_name: "",
                discount: 0,
                is_credit: false,
                paid_amount: 0,
            })
            setIsDialogOpen(false)
            refetch()
        } catch (error) {
            console.error("Place order error:", error)
            toast.error("Gagal membuat pesanan", {
                description: error instanceof Error ? error.message : "Silakan coba lagi",
            })
        } finally {
            setIsLoading(false)
        }
    }

    if (isError) {
        return (
            <section className="flex h-full gap-6 p-6 bg-muted/30">
                <Card className="border-2 w-full">
                    <CardContent className="p-6">
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <p className="text-destructive">
                                {error instanceof Error ? error.message : "Gagal memuat data produk"}
                            </p>
                            <Button onClick={() => refetch()} variant="outline">
                                <IconRefresh className="mr-2 size-4" />
                                Coba Lagi
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </section>
        )
    }

    return (
        <section className="flex h-full gap-6 p-6 bg-muted/30">
            {/* Main Content Area */}
            <div className="flex-1">
                {/* Search and Refresh */}
                <div className="flex gap-4 mb-6">
                    <div className="relative flex-1">
                        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                            placeholder="Cari produk..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <Button
                        onClick={() => refetch()}
                        size="sm"
                        variant="outline"
                        disabled={isFetching}
                    >
                        <IconRefresh className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                {/* Categories */}
                {categories.length > 0 && (
                    <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`flex flex-col items-center gap-2 p-4 rounded-lg border min-w-[120px] transition-all ${
                                selectedCategory === null
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
                            }`}
                        >
                            <IconPackage className="size-6" />
                            <span className="font-medium text-sm">Semua</span>
                            <span className="text-xs opacity-75">
                                {filteredProducts.length} Produk
                            </span>
                        </button>
                        {categories.map((category) => {
                            const isSelected = category.name === selectedCategory
                            return (
                                <button
                                    key={category.name}
                                    onClick={() => setSelectedCategory(category.name)}
                                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border min-w-[120px] transition-all ${
                                        isSelected
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-card border-border hover:bg-accent hover:text-accent-foreground"
                                    }`}
                                >
                                    <IconPackage className="size-6" />
                                    <span className="font-medium text-sm">{category.name}</span>
                                    <span className="text-xs opacity-75">
                                        {category.count} Produk
                                    </span>
                                </button>
                            )
                        })}
                    </div>
                )}

                {/* Category Title */}
                {selectedCategory && (
                    <h2 className="text-2xl font-bold mb-6">{selectedCategory}</h2>
                )}

                {/* Products Grid */}
                {isLoadingProducts ? (
                    <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: 9 }).map((_, index) => (
                            <Card key={index} className="overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <Skeleton className="w-20 h-20 rounded-full shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <Skeleton className="h-5 w-3/4 mb-2" />
                                            <Skeleton className="h-4 w-1/2 mb-2" />
                                            <Skeleton className="h-6 w-20 mb-3" />
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground text-lg">
                            Tidak ada produk tersedia
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-4">
                        {filteredProducts.map((product) => {
                            const productId = String(product.id)
                            const quantity = quantities[productId] || 0
                            return (
                                <Card key={productId} className="overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex gap-4">
                                            <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted shrink-0">
                                                <Image
                                                    src={product.image_url || "/placeholder-product.png"}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="80px"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-lg mb-1">{product.name}</h3>
                                                {product.category_name && (
                                                    <p className="text-xs text-muted-foreground mb-2">
                                                        {product.category_name}
                                                    </p>
                                                )}
                                                <p className="text-xl font-bold text-primary mb-1">
                                                    {new Intl.NumberFormat("id-ID", {
                                                        style: "currency",
                                                        currency: "IDR",
                                                        minimumFractionDigits: 0,
                                                    }).format(product.price)}
                                                </p>
                                                {product.unit && (
                                                    <p className="text-xs text-muted-foreground mb-3">
                                                        Unit: {product.unit}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    {(product.unit === "meter" || product.unit === "liter") ? (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="flex-1"
                                                                onClick={() => handleOpenQuantityDialog({
                                                                    id: productId,
                                                                    name: product.name,
                                                                    unit: product.unit
                                                                })}
                                                            >
                                                                <IconEdit className="size-4 mr-2" />
                                                                {quantity > 0 ? `${quantity % 1 === 0 ? quantity : quantity.toFixed(2)} ${product.unit}` : `Input ${product.unit}`}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Button
                                                                variant="outline"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full"
                                                                onClick={() => handleQuantityChange(productId, -1)}
                                                                disabled={quantity === 0}
                                                            >
                                                                <IconMinus className="size-4" />
                                                            </Button>
                                                            <span className="w-8 text-center font-medium">
                                                                {quantity}
                                                            </span>
                                                            <Button
                                                                variant="default"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-full"
                                                                onClick={() => handleQuantityChange(productId, 1)}
                                                            >
                                                                <IconPlus className="size-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Invoice Sidebar */}
            <div className="w-96 bg-card rounded-lg shadow-lg p-6 flex flex-col h-fit sticky top-6 border">
                {/* Invoice Section */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Invoice</h2>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {cartItems.length === 0 ? (
                            <p className="text-muted-foreground text-sm text-center py-4">
                                Keranjang kosong
                            </p>
                        ) : (
                            cartItems.map((item) => (
                                <div
                                    key={item.product_id}
                                    className="flex gap-3 pb-3 border-b border-border last:border-0"
                                >
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                                        {item.image_url && (
                                            <Image
                                                src={item.image_url}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                                sizes="48px"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.quantity % 1 === 0 
                                                ? `${item.quantity}${item.unit ? ` ${item.unit}` : "x"}` 
                                                : `${item.quantity.toFixed(2)}${item.unit ? ` ${item.unit}` : ""}`}
                                        </p>
                                        <p className="text-sm font-semibold mt-1">
                                            {new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0,
                                            }).format(item.price)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Payment Summary */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold mb-4">Payment Summary</h2>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Sub Total</span>
                            <span className="font-medium">
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                }).format(subtotal)}
                            </span>
                        </div>
                        {discountAmount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Discount</span>
                                <span className="font-medium text-red-600">
                                    -{new Intl.NumberFormat("id-ID", {
                                        style: "currency",
                                        currency: "IDR",
                                        minimumFractionDigits: 0,
                                    }).format(discountAmount)}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                            <span>Total Payment</span>
                            <span>
                                {new Intl.NumberFormat("id-ID", {
                                    style: "currency",
                                    currency: "IDR",
                                    minimumFractionDigits: 0,
                                }).format(total)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 p-4 rounded-lg border border-border bg-muted/50">
                        <IconCash className="size-6 text-primary" />
                        <div>
                            <p className="font-medium text-sm">Payment Method</p>
                            <p className="text-xs text-muted-foreground">Cash Payment</p>
                        </div>
                    </div>
                </div>

                {/* Place Order Button */}
                <Button
                    className="w-full py-6 text-lg font-semibold"
                    disabled={cartItems.length === 0 || isLoading}
                    onClick={handlePlaceOrder}
                >
                    Place An Order
                </Button>
            </div>

            {/* Transaction Form Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Complete Transaction</DialogTitle>
                        <DialogDescription>
                            Silakan isi detail transaksi sebelum membuat pesanan
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmitTransaction} className="space-y-4">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="customer_name">
                                    Customer Name
                                    {formData.is_credit && (
                                        <span className="text-destructive ml-1">*</span>
                                    )}
                                </FieldLabel>
                                <Input
                                    id="customer_name"
                                    type="text"
                                    placeholder={
                                        formData.is_credit
                                            ? "Masukkan nama pelanggan (wajib)"
                                            : "Masukkan nama pelanggan (opsional)"
                                    }
                                    value={formData.customer_name}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            customer_name: e.target.value,
                                        }))
                                    }
                                    disabled={isLoading}
                                    required={formData.is_credit}
                                />
                                <FieldDescription>
                                    {formData.is_credit
                                        ? "Nama pelanggan wajib untuk transaksi kasbon"
                                        : "Kosongkan untuk pelanggan walk-in"}
                                </FieldDescription>
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="discount">Discount</FieldLabel>
                                <Input
                                    id="discount"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={formData.discount}
                                    onChange={(e) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            discount: Number(e.target.value) || 0,
                                        }))
                                    }
                                    disabled={isLoading}
                                />
                                <FieldDescription>
                                    Masukkan jumlah diskon (jika ada)
                                </FieldDescription>
                            </Field>
                            <Field>
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col gap-1">
                                        <Label htmlFor="is_credit" className="text-sm font-medium">
                                            Credit Transaction (Kasbon)
                                        </Label>
                                        <FieldDescription>
                                            Aktifkan untuk transaksi kasbon
                                        </FieldDescription>
                                    </div>
                                    <Switch
                                        id="is_credit"
                                        checked={formData.is_credit}
                                        onCheckedChange={(checked) => {
                                            const currentTotal = cartItems.reduce(
                                                (sum, item) => sum + item.price * item.quantity,
                                                0
                                            )
                                            const currentDiscount = Number(formData.discount) || 0
                                            const currentSubtotal = Math.max(0, currentTotal - currentDiscount)
                                            const currentTotalAmount = currentSubtotal

                                            setFormData((prev) => ({
                                                ...prev,
                                                is_credit: checked,
                                                paid_amount: checked ? (prev.paid_amount || 0) : currentTotalAmount,
                                            }))
                                        }}
                                        disabled={isLoading}
                                    />
                                </div>
                            </Field>
                            {formData.is_credit && (
                                <Field>
                                    <FieldLabel htmlFor="paid_amount">Paid Amount</FieldLabel>
                                    <Input
                                        id="paid_amount"
                                        type="number"
                                        min="0"
                                        max={total}
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.paid_amount}
                                        onChange={(e) => {
                                            const paid = Number(e.target.value) || 0
                                            setFormData((prev) => ({
                                                ...prev,
                                                paid_amount: Math.min(paid, total),
                                            }))
                                        }}
                                        disabled={isLoading}
                                    />
                                    <FieldDescription>
                                        Jumlah yang dibayar pelanggan (maks: {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        }).format(total)})
                                    </FieldDescription>
                                </Field>
                            )}
                        </FieldGroup>

                        {/* Order Summary in Dialog */}
                        <div className="p-4 rounded-lg border border-border bg-muted/30">
                            <h3 className="font-semibold mb-3">Order Summary</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sub Total</span>
                                    <span>
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        }).format(subtotal)}
                                    </span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Discount</span>
                                        <span className="text-red-600">
                                            -{new Intl.NumberFormat("id-ID", {
                                                style: "currency",
                                                currency: "IDR",
                                                minimumFractionDigits: 0,
                                            }).format(discountAmount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-2 border-t border-border font-bold">
                                    <span>Total Payment</span>
                                    <span>
                                        {new Intl.NumberFormat("id-ID", {
                                            style: "currency",
                                            currency: "IDR",
                                            minimumFractionDigits: 0,
                                        }).format(total)}
                                    </span>
                                </div>
                                {formData.is_credit && (
                                    <>
                                        <div className="flex justify-between pt-2 border-t border-border">
                                            <span className="text-muted-foreground">Paid Amount</span>
                                            <span>
                                                {new Intl.NumberFormat("id-ID", {
                                                    style: "currency",
                                                    currency: "IDR",
                                                    minimumFractionDigits: 0,
                                                }).format(paidAmount)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Due Amount</span>
                                            <span className="font-bold text-orange-600">
                                                {new Intl.NumberFormat("id-ID", {
                                                    style: "currency",
                                                    currency: "IDR",
                                                    minimumFractionDigits: 0,
                                                }).format(dueAmount)}
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                        <IconLoader className="size-4 animate-spin mr-2" />
                                        Processing...
                                    </>
                                ) : (
                                    "Confirm Order"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Custom Quantity Input Dialog */}
            <Dialog open={isQuantityDialogOpen} onOpenChange={setIsQuantityDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Input Quantity</DialogTitle>
                        <DialogDescription>
                            Masukkan jumlah {selectedProductForQuantity?.unit || ""} untuk {selectedProductForQuantity?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Field>
                            <FieldLabel htmlFor="custom_quantity">
                                Jumlah ({selectedProductForQuantity?.unit || ""})
                            </FieldLabel>
                            <Input
                                id="custom_quantity"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                value={customQuantity}
                                onChange={(e) => setCustomQuantity(e.target.value)}
                                autoFocus
                            />
                            <FieldDescription>
                                Masukkan jumlah dengan desimal (contoh: 1.5 untuk 1.5 {selectedProductForQuantity?.unit || ""})
                            </FieldDescription>
                        </Field>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsQuantityDialogOpen(false)
                                setSelectedProductForQuantity(null)
                                setCustomQuantity("")
                            }}
                        >
                            Cancel
                        </Button>
                        <Button type="button" onClick={handleCustomQuantitySubmit}>
                            Simpan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    )
}

export default function ProductsKaryawan() {
    return (
        <QueryClientProvider client={queryClient}>
            <ProductsKaryawanContent />
        </QueryClientProvider>
    )
}
