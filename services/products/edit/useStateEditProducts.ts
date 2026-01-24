import * as React from "react"

import { useRouter } from "next/navigation"

import { toast } from "sonner"

import { Html5Qrcode } from "html5-qrcode"

import { API_CONFIG, fetchBranches, fetchSuppliers } from "@/lib/config"

import { formatNumber, parseNumber, toDateInputValue } from "@/lib/format-idr"

const NO_BRANCH_VALUE = "__none__"

const generateBarcode = (): string => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `PRD${timestamp}${random.toString().padStart(4, "0")}`
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
    // State untuk nilai yang diformat (display value)
    const [priceDisplay, setPriceDisplay] = React.useState("")
    const [modalDisplay, setModalDisplay] = React.useState("")
    const [stockDisplay, setStockDisplay] = React.useState("")
    const [minStockDisplay, setMinStockDisplay] = React.useState("")
    const [sizeDisplay, setSizeDisplay] = React.useState("")
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
            setPriceDisplay(p.price !== undefined && p.price !== null ? formatNumber(p.price) : "")
            setModalDisplay(p.modal !== undefined && p.modal !== null ? formatNumber(p.modal) : "")
            setStockDisplay(p.stock !== undefined && p.stock !== null ? formatNumber(p.stock) : "")
            setMinStockDisplay(p.min_stock !== undefined && p.min_stock !== null ? formatNumber(p.min_stock) : "")
            setSizeDisplay(p.size !== undefined && p.size !== null ? formatNumber(p.size) : "")
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

    // Handler untuk format saat blur (selesai mengetik)
    const handlePriceBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const parsed = parseNumber(e.target.value)
        if (parsed) {
            setPriceDisplay(formatNumber(parsed))
        } else {
            setPriceDisplay("")
        }
    }

    const handleModalBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const parsed = parseNumber(e.target.value)
        if (parsed) {
            setModalDisplay(formatNumber(parsed))
        } else {
            setModalDisplay("")
        }
    }

    const handleStockBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const parsed = parseNumber(e.target.value)
        if (parsed) {
            setStockDisplay(formatNumber(parsed))
        } else {
            setStockDisplay("")
        }
    }

    const handleMinStockBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const parsed = parseNumber(e.target.value)
        if (parsed) {
            setMinStockDisplay(formatNumber(parsed))
        } else {
            setMinStockDisplay("")
        }
    }

    // Handler untuk onChange (format real-time saat mengetik)
    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        // Jika kosong, set kosong
        if (!value || value.trim() === "") {
            setPriceDisplay("")
            return
        }

        // Hapus semua karakter non-numeric kecuali titik (yang sudah ada dari format sebelumnya)
        const cleaned = value.replace(/\./g, "").replace(/[^\d]/g, "")

        if (!cleaned) {
            setPriceDisplay("")
            return
        }

        // Format angka
        const num = parseFloat(cleaned)
        if (!isNaN(num)) {
            setPriceDisplay(formatNumber(num))
        } else {
            setPriceDisplay(cleaned)
        }
    }

    const handleModalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        if (!value || value.trim() === "") {
            setModalDisplay("")
            return
        }

        const cleaned = value.replace(/\./g, "").replace(/[^\d]/g, "")

        if (!cleaned) {
            setModalDisplay("")
            return
        }

        const num = parseFloat(cleaned)
        if (!isNaN(num)) {
            setModalDisplay(formatNumber(num))
        } else {
            setModalDisplay(cleaned)
        }
    }

    const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        if (!value || value.trim() === "") {
            setStockDisplay("")
            return
        }

        const cleaned = value.replace(/\./g, "").replace(/[^\d]/g, "")

        if (!cleaned) {
            setStockDisplay("")
            return
        }

        const num = parseFloat(cleaned)
        if (!isNaN(num)) {
            setStockDisplay(formatNumber(num))
        } else {
            setStockDisplay(cleaned)
        }
    }

    const handleMinStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value

        if (!value || value.trim() === "") {
            setMinStockDisplay("")
            return
        }

        const cleaned = value.replace(/\./g, "").replace(/[^\d]/g, "")

        if (!cleaned) {
            setMinStockDisplay("")
            return
        }

        const num = parseFloat(cleaned)
        if (!isNaN(num)) {
            setMinStockDisplay(formatNumber(num))
        } else {
            setMinStockDisplay(cleaned)
        }
    }

    const handleSizeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const parsed = parseNumber(e.target.value)
        if (parsed) {
            setSizeDisplay(formatNumber(parsed))
        } else {
            setSizeDisplay("")
        }
    }

    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (!value || value.trim() === "") {
            setSizeDisplay("")
            return
        }
        const cleaned = value.replace(/\./g, "").replace(/[^\d]/g, "")
        if (!cleaned) {
            setSizeDisplay("")
            return
        }
        const num = parseFloat(cleaned)
        if (!isNaN(num)) {
            setSizeDisplay(formatNumber(num))
        } else {
            setSizeDisplay(cleaned)
        }
    }

    // Update hidden input setiap kali display value berubah
    React.useEffect(() => {
        const priceHidden = formRef.current?.querySelector('input[name="price"]') as HTMLInputElement
        if (priceHidden) {
            priceHidden.value = parseNumber(priceDisplay)
        }
    }, [priceDisplay])

    React.useEffect(() => {
        const modalHidden = formRef.current?.querySelector('input[name="modal"]') as HTMLInputElement
        if (modalHidden) {
            modalHidden.value = parseNumber(modalDisplay)
        }
    }, [modalDisplay])

    React.useEffect(() => {
        const stockHidden = formRef.current?.querySelector('input[name="stock"]') as HTMLInputElement
        if (stockHidden) {
            stockHidden.value = parseNumber(stockDisplay)
        }
    }, [stockDisplay])

    React.useEffect(() => {
        const minStockHidden = formRef.current?.querySelector('input[name="min_stock"]') as HTMLInputElement
        if (minStockHidden) {
            minStockHidden.value = parseNumber(minStockDisplay)
        }
    }, [minStockDisplay])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!productId) return

        // Sekarang kita kirim kembali ID murni (bukan nama)
        setIsSubmitting(true)
        try {
            // Find branch_name, supplier_name and category_name from selected IDs
            // Ensure proper type comparison (ID might be string or number)
            let branchName: string | undefined = undefined
            let categoryName: string | undefined = undefined
            let supplierName: string | undefined = undefined

            if (branchId) {
                const selectedBranch = branches.find((b) => String(b.id) === String(branchId))
                if (selectedBranch && selectedBranch.name) {
                    branchName = selectedBranch.name
                }
            }

            if (supplierId) {
                const selectedSupplier = suppliers.find((s) => String(s.id) === String(supplierId))
                if (selectedSupplier && selectedSupplier.name) {
                    supplierName = selectedSupplier.name
                }
            }

            if (categoryId) {
                const selectedCategory = categories.find((c) => String(c.id) === String(categoryId))
                if (selectedCategory && selectedCategory.name) {
                    categoryName = selectedCategory.name
                }
            }

            const response = await fetch(API_CONFIG.ENDPOINTS.products.byId(productId), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${API_CONFIG.SECRET}`,
                },
                body: JSON.stringify({
                    name,
                    price: priceDisplay ? Number(parseNumber(priceDisplay)) : undefined,
                    modal: modalDisplay ? Number(parseNumber(modalDisplay)) : undefined,
                    stock: stockDisplay ? Number(parseNumber(stockDisplay)) : undefined,
                    min_stock: minStockDisplay ? Number(parseNumber(minStockDisplay)) : undefined,
                    size: sizeDisplay ? Number(parseNumber(sizeDisplay)) : undefined,
                    unit: unit || undefined,
                    barcode,
                    expiration_date: expirationDate ? expirationDate : undefined,
                    description: description ? description : undefined,
                    is_active: isActive === "true",
                    image_url: imageUrl,
                    // Kirim ID apa adanya ke backend
                    branch_id: branchId || undefined,
                    branch_name: branchName,
                    supplier_id: supplierId || undefined,
                    supplier_name: supplierName,
                    category_id: categoryId || undefined,
                    category_name: categoryName,
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
        // Format number state
        priceDisplay,
        modalDisplay,
        stockDisplay,
        minStockDisplay,
        // Format number handlers
        handlePriceChange,
        handleModalChange,
        handleStockChange,
        handleMinStockChange,
        handlePriceBlur,
        handleModalBlur,
        handleStockBlur,
        handleMinStockBlur,
        sizeDisplay,
        handleSizeChange,
        handleSizeBlur,
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
