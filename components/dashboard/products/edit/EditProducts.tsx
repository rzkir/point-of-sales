"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { IconLoader } from "@tabler/icons-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"

const NO_BRANCH_VALUE = "__none__"

interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

interface Supplier {
    id: number | string
    name: string
}

interface Category {
    id: string
    uid: string
    name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

type Product = {
    id: string | number
    name: string
    price?: number
    modal?: number
    stock?: number
    min_stock?: number
    unit?: string
    barcode?: string
    is_active?: boolean
    image_url?: string
    branch_id?: string
    supplier_id?: number | string
    category_id?: string
    expiration_date?: string
    description?: string
}

export default function EditProducts({ productId }: { productId?: string }) {
    const router = useRouter()

    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    const [branches, setBranches] = React.useState<Branch[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
    const [isLoadingSuppliers, setIsLoadingSuppliers] = React.useState(false)
    const [categories, setCategories] = React.useState<Category[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = React.useState(false)

    const [product, setProduct] = React.useState<Product | null>(null)

    // controlled fields (so we can prefill after fetch)
    const [name, setName] = React.useState("")
    const [price, setPrice] = React.useState("")
    const [modal, setModal] = React.useState("")
    const [stock, setStock] = React.useState("")
    const [minStock, setMinStock] = React.useState("")
    const [unit, setUnit] = React.useState("")
    const [barcode, setBarcode] = React.useState("")
    const [imageUrl, setImageUrl] = React.useState("")
    const [expirationDate, setExpirationDate] = React.useState("")
    const [description, setDescription] = React.useState("")
    const [isActive, setIsActive] = React.useState(true)
    const [branchId, setBranchId] = React.useState("")
    const [supplierId, setSupplierId] = React.useState("")
    const [categoryId, setCategoryId] = React.useState("")

    const toDateInputValue = (value: unknown): string => {
        if (!value) return ""
        const s = String(value).trim()
        if (!s) return ""
        // ISO -> YYYY-MM-DD
        if (s.includes("T")) return s.split("T")[0] ?? ""
        // already YYYY-MM-DD...
        if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
        return ""
    }

    const loadProduct = React.useCallback(async () => {
        if (!productId) {
            toast.error("Product ID is missing")
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(`/api/products/${encodeURIComponent(productId)}`)
            const data = await response.json().catch(() => ({}))

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to fetch product")
            }

            const p: Product = data.data
            setProduct(p)

            setName(String(p.name ?? ""))
            setPrice(p.price !== undefined && p.price !== null ? String(p.price) : "")
            setModal(p.modal !== undefined && p.modal !== null ? String(p.modal) : "")
            setStock(p.stock !== undefined && p.stock !== null ? String(p.stock) : "")
            setMinStock(p.min_stock !== undefined && p.min_stock !== null ? String(p.min_stock) : "")
            setUnit(p.unit ? String(p.unit) : "")
            setBarcode(p.barcode ? String(p.barcode) : "")
            setImageUrl(p.image_url ? String(p.image_url) : "")
            setExpirationDate(toDateInputValue(p.expiration_date))
            setDescription(p.description ? String(p.description) : "")
            setIsActive(p.is_active === false ? false : true)
            setBranchId(p.branch_id ? String(p.branch_id) : "")
            setSupplierId(p.supplier_id !== undefined && p.supplier_id !== null ? String(p.supplier_id) : "")
            setCategoryId(p.category_id ? String(p.category_id) : "")
        } catch (error) {
            console.error("Load product error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to fetch product")
        } finally {
            setIsLoading(false)
        }
    }, [productId])

    const fetchBranches = async () => {
        setIsLoadingBranches(true)
        try {
            const response = await fetch("/api/branches")
            const data = await response.json()
            if (data.success) setBranches(data.data || [])
        } catch (error) {
            console.error("Failed to fetch branches:", error)
        } finally {
            setIsLoadingBranches(false)
        }
    }

    const fetchSuppliers = async () => {
        setIsLoadingSuppliers(true)
        try {
            const response = await fetch("/api/supplier")
            const data = await response.json()
            if (data.success) setSuppliers(data.data || [])
        } catch (error) {
            console.error("Failed to fetch suppliers:", error)
        } finally {
            setIsLoadingSuppliers(false)
        }
    }

    const fetchCategories = async () => {
        setIsLoadingCategories(true)
        try {
            const response = await fetch("/api/categories")
            const data = await response.json()
            if (data.success) {
                const list: Category[] = data.data || []
                setCategories(list.filter((c) => c.is_active))
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setIsLoadingCategories(false)
        }
    }

    React.useEffect(() => {
        void loadProduct()
        void fetchBranches()
        void fetchSuppliers()
        void fetchCategories()
    }, [loadProduct])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!productId) return

        setIsSubmitting(true)
        try {
            const response = await fetch(`/api/products/${encodeURIComponent(productId)}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    price: price ? Number(price) : undefined,
                    modal: modal ? Number(modal) : undefined,
                    stock: stock ? Number(stock) : undefined,
                    min_stock: minStock ? Number(minStock) : undefined,
                    unit,
                    barcode,
                    expiration_date: expirationDate ? expirationDate : undefined,
                    description: description ? description : undefined,
                    is_active: isActive,
                    image_url: imageUrl,
                    branch_id: branchId ? branchId : undefined,
                    supplier_id: supplierId ? supplierId : undefined,
                    category_id: categoryId ? categoryId : undefined,
                }),
            })

            const data = await response.json().catch(() => ({}))
            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to update product")
            }

            toast.success("Product updated successfully")
            router.push("/dashboard/products")
        } catch (error) {
            console.error("Update product error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to update product")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!productId) {
        return (
            <Card className="mx-auto max-w-3xl p-6">
                <p className="text-sm text-muted-foreground">Missing product id in URL. Example: `/dashboard/products/edit?id=...`</p>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => router.back()}>Back</Button>
                </div>
            </Card>
        )
    }

    if (isLoading) {
        return (
            <Card className="mx-auto max-w-3xl p-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconLoader className="size-4 animate-spin" />
                    Loading product...
                </div>
            </Card>
        )
    }

    if (!product) {
        return (
            <Card className="mx-auto max-w-3xl p-6">
                <p className="text-sm text-muted-foreground">Product not found.</p>
                <div className="mt-4 flex justify-end">
                    <Button variant="outline" onClick={() => router.back()}>Back</Button>
                </div>
            </Card>
        )
    }

    return (
        <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Edit Product</h1>
                <p className="text-sm text-muted-foreground">
                    Update produk. Data akan disimpan ke Google Sheets &quot;Products&quot;.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nama produk"
                            required
                            disabled={isSubmitting}
                        />
                        <FieldDescription>Nama produk wajib diisi.</FieldDescription>
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="price">Price</FieldLabel>
                            <Input
                                id="price"
                                type="number"
                                min={0}
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="0"
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="modal">Modal</FieldLabel>
                            <Input
                                id="modal"
                                type="number"
                                min={0}
                                step="0.01"
                                value={modal}
                                onChange={(e) => setModal(e.target.value)}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="stock">Stock</FieldLabel>
                            <Input
                                id="stock"
                                type="number"
                                min={0}
                                step="1"
                                value={stock}
                                onChange={(e) => setStock(e.target.value)}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="min_stock">Min Stock</FieldLabel>
                            <Input
                                id="min_stock"
                                type="number"
                                min={0}
                                step="1"
                                value={minStock}
                                onChange={(e) => setMinStock(e.target.value)}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                            <FieldDescription>Minimum stok sebelum dianggap menipis (opsional).</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="expiration_date">Expiration Date</FieldLabel>
                            <Input
                                id="expiration_date"
                                type="date"
                                value={expirationDate}
                                onChange={(e) => setExpirationDate(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <FieldDescription>Tanggal kadaluarsa (opsional).</FieldDescription>
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field>
                            <FieldLabel htmlFor="unit">Unit</FieldLabel>
                            <Input
                                id="unit"
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                                placeholder="pcs / box / kg"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="barcode">Barcode</FieldLabel>
                            <Input
                                id="barcode"
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                                placeholder="Kode barcode (opsional)"
                                disabled={isSubmitting}
                            />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Deskripsi produk (opsional)"
                            disabled={isSubmitting}
                        />
                        <FieldDescription>Catatan/deskripsi produk (opsional).</FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="image_url">Image URL</FieldLabel>
                        <Input
                            id="image_url"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            placeholder="https://..."
                            disabled={isSubmitting}
                        />
                        <FieldDescription>
                            Opsional. Jika pakai ImageKit upload, isi URL di sini.
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="supplier_id">Supplier</FieldLabel>
                        <Select
                            value={supplierId}
                            onValueChange={setSupplierId}
                            disabled={isSubmitting || isLoadingSuppliers}
                        >
                            <SelectTrigger id="supplier_id">
                                <SelectValue placeholder={isLoadingSuppliers ? "Loading suppliers..." : "Select supplier (optional)"} />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldDescription>Pilih supplier untuk produk ini (opsional).</FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="category_id">Category</FieldLabel>
                        <Select
                            value={categoryId}
                            onValueChange={setCategoryId}
                            disabled={isSubmitting || isLoadingCategories}
                        >
                            <SelectTrigger id="category_id">
                                <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select category (optional)"} />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldDescription>Pilih kategori untuk produk ini (opsional).</FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="branch_id">Branch</FieldLabel>
                        <Select
                            value={branchId || NO_BRANCH_VALUE}
                            onValueChange={(value) => setBranchId(value === NO_BRANCH_VALUE ? "" : value)}
                            disabled={isSubmitting || isLoadingBranches}
                        >
                            <SelectTrigger id="branch_id">
                                <SelectValue placeholder={isLoadingBranches ? "Loading branches..." : "Select branch (optional)"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NO_BRANCH_VALUE}>No Branch</SelectItem>
                                {branches.map((branch) => (
                                    <SelectItem key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldDescription>Pilih branch untuk produk ini (opsional).</FieldDescription>
                    </Field>

                    <Field>
                        <div className="flex items-center justify-between rounded-md border px-3 py-2">
                            <div>
                                <FieldLabel htmlFor="is_active">Active</FieldLabel>
                                <FieldDescription>
                                    Jika nonaktif, produk tidak akan ditampilkan di daftar aktif.
                                </FieldDescription>
                            </div>
                            <Switch
                                id="is_active"
                                checked={isActive}
                                onCheckedChange={setIsActive}
                                disabled={isSubmitting}
                            />
                        </div>
                    </Field>
                </FieldGroup>

                <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <IconLoader className="mr-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Update Product"
                        )}
                    </Button>
                </div>
            </form>
        </section>
    )
}
