import * as React from "react"

import { useRouter } from "next/navigation"

import { toast } from "sonner"

import { Html5Qrcode } from "html5-qrcode"

import { API_CONFIG, fetchBranches, fetchSuppliers, type BranchRow, type SupplierRow } from "@/lib/config"

const NO_BRANCH_VALUE = "__none__"

// Generate unique barcode
const generateBarcode = (): string => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `PRD${timestamp}${random.toString().padStart(4, "0")}`
}

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

export function useStateEditProducts(productId?: string) {
    const router = useRouter()

    const [isLoading, setIsLoading] = React.useState(true)
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isUploadingImage, setIsUploadingImage] = React.useState(false)

    const [branches, setBranches] = React.useState<BranchRow[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const [suppliers, setSuppliers] = React.useState<SupplierRow[]>([])
    const [isLoadingSuppliers, setIsLoadingSuppliers] = React.useState(false)
    const [categories, setCategories] = React.useState<Category[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = React.useState(false)

    const [product, setProduct] = React.useState<Products | null>(null)

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
    const [isActive, setIsActive] = React.useState("true")
    const [branchId, setBranchId] = React.useState("")
    const [supplierId, setSupplierId] = React.useState("")
    const [categoryId, setCategoryId] = React.useState("")
    const [isScanning, setIsScanning] = React.useState(false)
    const [showScanDialog, setShowScanDialog] = React.useState(false)
    const scannerRef = React.useRef<Html5Qrcode | null>(null)
    const scanElementId = "barcode-scanner-edit"
    const formRef = React.useRef<HTMLFormElement>(null)

    const loadProduct = React.useCallback(async () => {
        if (!productId) {
            toast.error("Product ID is missing")
            setIsLoading(false)
            return
        }

        try {
            setIsLoading(true)
            const response = await fetch(API_CONFIG.ENDPOINTS.products.byId(productId), {
                headers: {
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
            })
            const data = await response.json().catch(() => ({}))

            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Failed to fetch product")
            }

            const p: Products = data.data
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
            setIsActive(p.is_active === false ? "false" : "true")
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

    const loadBranches = async () => {
        setIsLoadingBranches(true)
        try {
            const data = await fetchBranches()
            setBranches(data.data || [])
        } catch (error) {
            console.error("Failed to fetch branches:", error)
        } finally {
            setIsLoadingBranches(false)
        }
    }

    const loadSuppliers = async () => {
        setIsLoadingSuppliers(true)
        try {
            const data = await fetchSuppliers()
            setSuppliers(data.data || [])
        } catch (error) {
            console.error("Failed to fetch suppliers:", error)
        } finally {
            setIsLoadingSuppliers(false)
        }
    }

    const fetchCategories = async () => {
        setIsLoadingCategories(true)
        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.categories.base, {
                headers: {
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
            })
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
        void loadBranches()
        void loadSuppliers()
        void fetchCategories()
    }, [loadProduct])

    const generateNewBarcode = () => {
        setBarcode(generateBarcode())
        toast.success("Barcode baru telah dihasilkan")
    }

    const startScanning = async () => {
        try {
            setShowScanDialog(true)
            setIsScanning(true)

            // Wait for dialog to render
            await new Promise((resolve) => setTimeout(resolve, 100))

            const scanner = new Html5Qrcode(scanElementId)
            scannerRef.current = scanner

            await scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                (decodedText) => {
                    setBarcode(decodedText)
                    stopScanning()
                    toast.success("Barcode berhasil di-scan")
                },
                () => {
                    // Ignore scanning errors (they're frequent during scanning)
                }
            )
        } catch (error) {
            console.error("Error starting scanner:", error)
            toast.error("Gagal mengakses kamera. Pastikan izin kamera telah diberikan.")
            setIsScanning(false)
            setShowScanDialog(false)
        }
    }

    const stopScanning = async () => {
        try {
            if (scannerRef.current) {
                await scannerRef.current.stop()
                await scannerRef.current.clear()
                scannerRef.current = null
            }
        } catch (error) {
            console.error("Error stopping scanner:", error)
        } finally {
            setIsScanning(false)
            setShowScanDialog(false)
        }
    }

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploadingImage(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const apiSecret = process.env.NEXT_PUBLIC_API_SECRET || ""
            const response = await fetch("/api/products/upload", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${apiSecret}`,
                },
                body: formData,
            })

            const data = await response.json()
            if (!response.ok || !data.url) {
                throw new Error(data.error || data.message || "Failed to upload image")
            }

            setImageUrl(data.url)
            toast.success("Gambar berhasil diunggah")
        } catch (error) {
            console.error("Upload error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal mengunggah gambar")
        } finally {
            setIsUploadingImage(false)
        }
    }

    const removeImage = () => {
        setImageUrl("")
        // Reset file input
        const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ""
        }
        toast.success("Gambar telah dihapus")
    }

    // Cleanup scanner on unmount
    React.useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current
                    .stop()
                    .then(() => {
                        scannerRef.current?.clear()
                    })
                    .catch(() => { })
            }
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!productId) return

        // Map selected IDs to their corresponding names
        const selectedBranch = branchId ? branches.find((branch) => branch.id === branchId) : undefined
        const selectedSupplier = supplierId
            ? suppliers.find((supplier) => String(supplier.id) === supplierId)
            : undefined
        const selectedCategory = categoryId
            ? categories.find((category) => category.id === categoryId)
            : undefined

        setIsSubmitting(true)
        try {
            const response = await fetch(API_CONFIG.ENDPOINTS.products.byId(productId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
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
                    is_active: isActive === "true",
                    image_url: imageUrl,
                    // Simpan nama, bukan ID
                    branch_id: selectedBranch ? selectedBranch.name : undefined,
                    supplier_id: selectedSupplier ? selectedSupplier.name : undefined,
                    category_id: selectedCategory ? selectedCategory.name : undefined,
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

    return {
        // Loading states
        isLoading,
        isSubmitting,
        isUploadingImage,
        // Product data
        product,
        // Form fields
        name,
        setName,
        price,
        setPrice,
        modal,
        setModal,
        stock,
        setStock,
        minStock,
        setMinStock,
        unit,
        setUnit,
        barcode,
        setBarcode,
        imageUrl,
        expirationDate,
        setExpirationDate,
        description,
        setDescription,
        isActive,
        setIsActive,
        branchId,
        setBranchId,
        supplierId,
        setSupplierId,
        categoryId,
        setCategoryId,
        // Dropdown data
        branches,
        isLoadingBranches,
        suppliers,
        isLoadingSuppliers,
        categories,
        isLoadingCategories,
        // Barcode scanning
        isScanning,
        showScanDialog,
        scanElementId,
        // Refs
        formRef,
        // Constants
        NO_BRANCH_VALUE,
        // Functions
        handleImageChange,
        handleSubmit,
        removeImage,
        generateNewBarcode,
        startScanning,
        stopScanning,
    }
}
