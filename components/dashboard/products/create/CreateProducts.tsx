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

export default function CreateProducts() {
    const router = useRouter()

    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isUploadingImage, setIsUploadingImage] = React.useState(false)
    const [imageUrl, setImageUrl] = React.useState("")
    const [branchId, setBranchId] = React.useState("")
    const [branches, setBranches] = React.useState<Branch[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const [supplierId, setSupplierId] = React.useState("")
    const [suppliers, setSuppliers] = React.useState<Supplier[]>([])
    const [isLoadingSuppliers, setIsLoadingSuppliers] = React.useState(false)
    const [categoryId, setCategoryId] = React.useState("")
    const [categories, setCategories] = React.useState<Category[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = React.useState(false)
    const formRef = React.useRef<HTMLFormElement>(null)

    React.useEffect(() => {
        fetchBranches()
        fetchSuppliers()
        fetchCategories()
    }, [])

    const fetchBranches = async () => {
        setIsLoadingBranches(true)
        try {
            const response = await fetch("/api/branches")
            const data = await response.json()
            if (data.success) {
                setBranches(data.data || [])
            }
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
            if (data.success) {
                setSuppliers(data.data || [])
            }
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
                // only active categories for selection UX
                const list: Category[] = data.data || []
                setCategories(list.filter((c) => c.is_active))
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        } finally {
            setIsLoadingCategories(false)
        }
    }

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        setIsUploadingImage(true)
        try {
            const response = await fetch("/api/products/upload", {
                method: "POST",
                body: formData,
            })

            const data = await response.json()

            if (!response.ok || !data.url) {
                throw new Error(data.error || "Failed to upload image")
            }

            setImageUrl(data.url)
            toast.success("Image uploaded successfully")
        } catch (error) {
            console.error("Image upload error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to upload image")
        } finally {
            setIsUploadingImage(false)
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(event.currentTarget)

        const name = formData.get("name") as string
        const price = formData.get("price") as string
        const modal = formData.get("modal") as string
        const stock = formData.get("stock") as string
        const minStock = formData.get("min_stock") as string
        const unit = formData.get("unit") as string
        const barcode = formData.get("barcode") as string
        const expirationDate = formData.get("expiration_date") as string
        const description = formData.get("description") as string
        const isActive = formData.get("is_active") === "on"

        try {
            const response = await fetch("/api/products", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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
                    // supplier_id di sheet "Suppliers" adalah string; jangan dipaksa jadi Number()
                    supplier_id: supplierId ? supplierId : undefined,
                    category_id: categoryId ? categoryId : undefined,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to create product")
            }

            toast.success("Product created successfully")
            formRef.current?.reset()
            setImageUrl("")
            setBranchId("")
            setSupplierId("")
            setCategoryId("")

            router.push("/dashboard/products")
        } catch (error) {
            console.error("Create product error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create product")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Create Product</h1>
                <p className="text-sm text-muted-foreground">
                    Tambahkan produk baru ke sistem. Data akan disimpan ke Google Sheets &quot;Products&quot;.
                </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <Input
                            id="name"
                            name="name"
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
                                name="price"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0"
                                required
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="modal">Modal</FieldLabel>
                            <Input
                                id="modal"
                                name="modal"
                                type="number"
                                min={0}
                                step="0.01"
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="stock">Stock</FieldLabel>
                            <Input
                                id="stock"
                                name="stock"
                                type="number"
                                min={0}
                                step="1"
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
                                name="min_stock"
                                type="number"
                                min={0}
                                step="1"
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                            <FieldDescription>Minimum stok sebelum dianggap menipis (opsional).</FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="expiration_date">Expiration Date</FieldLabel>
                            <Input
                                id="expiration_date"
                                name="expiration_date"
                                type="date"
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
                                name="unit"
                                placeholder="pcs / box / kg"
                                disabled={isSubmitting}
                            />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="barcode">Barcode</FieldLabel>
                            <Input
                                id="barcode"
                                name="barcode"
                                placeholder="Kode barcode (opsional)"
                                disabled={isSubmitting}
                            />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Input
                            id="description"
                            name="description"
                            placeholder="Deskripsi produk (opsional)"
                            disabled={isSubmitting}
                        />
                        <FieldDescription>Catatan/deskripsi produk (opsional).</FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="supplier_id">Supplier</FieldLabel>
                        <Select
                            value={supplierId}
                            onValueChange={setSupplierId}
                            disabled={isSubmitting || isLoadingSuppliers}
                        >
                            <SelectTrigger id="supplier_id">
                                <SelectValue
                                    placeholder={
                                        isLoadingSuppliers
                                            ? "Loading suppliers..."
                                            : "Select supplier (optional)"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {suppliers.map((supplier) => (
                                    <SelectItem key={supplier.id} value={String(supplier.id)}>
                                        {supplier.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldDescription>
                            Pilih supplier untuk produk ini (opsional).
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="category_id">Category</FieldLabel>
                        <Select
                            value={categoryId}
                            onValueChange={setCategoryId}
                            disabled={isSubmitting || isLoadingCategories}
                        >
                            <SelectTrigger id="category_id">
                                <SelectValue
                                    placeholder={
                                        isLoadingCategories
                                            ? "Loading categories..."
                                            : "Select category (optional)"
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldDescription>
                            Pilih kategori untuk produk ini (opsional).
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="branch_id">Branch</FieldLabel>
                        <Select
                            value={branchId || NO_BRANCH_VALUE}
                            onValueChange={(value) => setBranchId(value === NO_BRANCH_VALUE ? "" : value)}
                            disabled={isSubmitting || isLoadingBranches}
                        >
                            <SelectTrigger id="branch_id">
                                <SelectValue
                                    placeholder={
                                        isLoadingBranches
                                            ? "Loading branches..."
                                            : "Select branch (optional)"
                                    }
                                />
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
                        <FieldDescription>
                            Pilih branch untuk produk ini (opsional).
                        </FieldDescription>
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="image">Image</FieldLabel>
                        <Input
                            id="image"
                            name="image"
                            type="file"
                            accept="image/*"
                            disabled={isSubmitting || isUploadingImage}
                            onChange={handleImageChange}
                        />
                        <FieldDescription>
                            Upload gambar produk (opsional). Gambar akan diunggah ke ImageKit.
                        </FieldDescription>
                        {imageUrl && (
                            <p className="mt-2 text-xs text-muted-foreground break-all">
                                Image URL: {imageUrl}
                            </p>
                        )}
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
                                name="is_active"
                                defaultChecked
                                disabled={isSubmitting}
                            />
                        </div>
                    </Field>
                </FieldGroup>

                <div className="flex items-center justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        disabled={isSubmitting}
                        onClick={() => router.back()}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting || isUploadingImage}>
                        {isSubmitting ? (
                            <>
                                <IconLoader className="mr-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Create Product"
                        )}
                    </Button>
                </div>
            </form>
        </section>
    )
}
