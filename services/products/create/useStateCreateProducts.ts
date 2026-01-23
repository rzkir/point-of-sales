import * as React from "react"

import { useRouter } from "next/navigation"

import { toast } from "sonner"

import { Html5Qrcode } from "html5-qrcode"

import { API_CONFIG, fetchBranches, fetchSuppliers } from "@/lib/config"

const NO_BRANCH_VALUE = "__none__"

// Generate unique barcode
const generateBarcode = (): string => {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    return `PRD${timestamp}${random.toString().padStart(4, "0")}`
}

export function useStateCreateProducts() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isUploadingImage, setIsUploadingImage] = React.useState(false)
    const [imageUrl, setImageUrl] = React.useState("")
    const [branchId, setBranchId] = React.useState("")
    const [branches, setBranches] = React.useState<BranchRow[]>([])
    const [isLoadingBranches, setIsLoadingBranches] = React.useState(false)
    const [supplierId, setSupplierId] = React.useState("")
    const [suppliers, setSuppliers] = React.useState<SupplierRow[]>([])
    const [isLoadingSuppliers, setIsLoadingSuppliers] = React.useState(false)
    const [categoryId, setCategoryId] = React.useState("")
    const [categories, setCategories] = React.useState<Category[]>([])
    const [isLoadingCategories, setIsLoadingCategories] = React.useState(false)
    const [isActive, setIsActive] = React.useState("true")
    const [barcode, setBarcode] = React.useState<string>("")
    const [isScanning, setIsScanning] = React.useState(false)
    const [showScanDialog, setShowScanDialog] = React.useState(false)
    const scannerRef = React.useRef<Html5Qrcode | null>(null)
    const scanElementId = "barcode-scanner"
    const formRef = React.useRef<HTMLFormElement>(null)

    // Generate barcode only on client side to avoid hydration mismatch
    React.useEffect(() => {
        setBarcode(generateBarcode())
    }, [])

    React.useEffect(() => {
        loadBranches()
        loadSuppliers()
        fetchCategories()
    }, [])

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

    const removeImage = () => {
        setImageUrl("")
        // Reset file input
        const fileInput = formRef.current?.querySelector('input[type="file"]') as HTMLInputElement
        if (fileInput) {
            fileInput.value = ""
        }
        toast.success("Image removed")
    }

    const resetForm = () => {
        formRef.current?.reset()
        setImageUrl("")
        setBranchId("")
        setSupplierId("")
        setCategoryId("")
        setBarcode(generateBarcode())
        setIsActive("true")
    }

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
        const isActiveValue = isActive === "true"

        try {
            // Find branch_name and category_name from selected IDs
            // Ensure proper type comparison (ID might be string or number)
            let branchName: string | undefined = undefined
            let categoryName: string | undefined = undefined

            if (branchId) {
                const selectedBranch = branches.find(b => String(b.id) === String(branchId))
                if (selectedBranch && selectedBranch.name) {
                    branchName = selectedBranch.name
                }
            }

            if (categoryId) {
                const selectedCategory = categories.find(c => String(c.id) === String(categoryId))
                if (selectedCategory && selectedCategory.name) {
                    categoryName = selectedCategory.name
                }
            }

            const response = await fetch(API_CONFIG.ENDPOINTS.products.base, {
                method: "POST",
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
                    is_active: isActiveValue,
                    image_url: imageUrl,
                    // Kirim ID murni ke backend (bukan nama)
                    branch_id: branchId || undefined,
                    branch_name: branchName,
                    supplier_id: supplierId || undefined,
                    category_id: categoryId || undefined,
                    category_name: categoryName,
                }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || "Failed to create product")
            }

            toast.success("Product created successfully")
            resetForm()

            router.push("/dashboard/products")
        } catch (error) {
            console.error("Create product error:", error)
            toast.error(error instanceof Error ? error.message : "Failed to create product")
        } finally {
            setIsSubmitting(false)
        }
    }

    return {
        // State
        isSubmitting,
        setIsSubmitting,
        isUploadingImage,
        imageUrl,
        branchId,
        setBranchId,
        branches,
        isLoadingBranches,
        supplierId,
        setSupplierId,
        suppliers,
        isLoadingSuppliers,
        categoryId,
        setCategoryId,
        categories,
        isLoadingCategories,
        isActive,
        setIsActive,
        barcode,
        setBarcode,
        isScanning,
        showScanDialog,
        setShowScanDialog,
        scanElementId,
        formRef,
        // Constants
        NO_BRANCH_VALUE,
        // Functions
        handleImageChange,
        handleSubmit,
        removeImage,
        resetForm,
        generateNewBarcode,
        startScanning,
        stopScanning,
    }
}
