"use client"

import { useRouter } from "next/navigation"

import Image from "next/image"

import { IconLoader, IconQrcode, IconRefresh } from "@tabler/icons-react"

import Barcode from "react-barcode"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"

import { Input } from "@/components/ui/input"

import { Textarea } from "@/components/ui/textarea"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Combobox } from "@/components/ui/combobox"

import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"

import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs"

import { useStateCreateProducts } from "@/services/products/create/useStateCreateProducts"

export default function CreateProducts() {
    const router = useRouter()

    const {
        isSubmitting,
        isUploadingImage,
        imageUrl,
        imageInputMode,
        setImageInputMode,
        imageUrlManual,
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
        scanElementId,
        formRef,
        NO_BRANCH_VALUE,
        priceDisplay,
        modalDisplay,
        stockDisplay,
        minStockDisplay,
        sizeDisplay,
        unit,
        setUnit,
        handlePriceChange,
        handleModalChange,
        handleStockChange,
        handleMinStockChange,
        handleSizeChange,
        handleSizeBlur,
        handlePriceBlur,
        handleModalBlur,
        handleStockBlur,
        handleMinStockBlur,
        handleImageChange,
        handleImageUrlChange,
        handleImageUrlBlur,
        handleSubmit,
        removeImage,
        generateNewBarcode,
        startScanning,
        stopScanning,
    } = useStateCreateProducts()

    return (
        <section className="flex flex-col gap-6 rounded-lg border bg-card p-6 shadow-sm">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Create Product</h1>
                <p className="text-sm text-muted-foreground">
                    Tambahkan produk baru ke sistem. Data akan disimpan ke Google Sheets &quot;Products&quot;.
                </p>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-6">
                <FieldGroup>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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

                        <Field>
                            <FieldLabel htmlFor="is_active">Status</FieldLabel>
                            <Select
                                value={isActive}
                                onValueChange={setIsActive}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="is_active">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldDescription>
                                Jika nonaktif, produk tidak akan ditampilkan di daftar aktif.
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="barcode">Barcode</FieldLabel>
                            <div className="flex gap-2">
                                <Input
                                    id="barcode"
                                    name="barcode"
                                    value={barcode}
                                    onChange={(e) => setBarcode(e.target.value)}
                                    placeholder="Kode barcode (opsional)"
                                    disabled={isSubmitting}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={generateNewBarcode}
                                    disabled={isSubmitting}
                                    title="Generate barcode baru"
                                >
                                    <IconRefresh className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={startScanning}
                                    disabled={isSubmitting || isScanning}
                                    title="Scan barcode dengan kamera"
                                >
                                    {isScanning ? (
                                        <IconLoader className="size-4 animate-spin" />
                                    ) : (
                                        <IconQrcode className="size-4" />
                                    )}
                                </Button>
                            </div>
                            <FieldDescription>
                                Barcode otomatis dihasilkan. Klik ikon refresh untuk generate baru atau ikon QR untuk scan.
                            </FieldDescription>
                            {barcode && (
                                <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-border bg-muted/30 p-4">
                                    <p className="text-xs font-medium text-muted-foreground">Barcode Preview</p>
                                    <div className="flex items-center justify-center rounded-md bg-white p-4">
                                        <Barcode
                                            value={barcode}
                                            format="CODE128"
                                            width={2}
                                            height={60}
                                            displayValue={true}
                                            fontSize={14}
                                            margin={10}
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground break-all">{barcode}</p>
                                </div>
                            )}
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="image">Image</FieldLabel>
                        <div className="space-y-4">
                            <Tabs
                                value={imageInputMode}
                                onValueChange={(value) => setImageInputMode(value as "url" | "upload")}
                                className="w-full"
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="upload">Upload File</TabsTrigger>
                                    <TabsTrigger value="url">Input URL</TabsTrigger>
                                </TabsList>
                                <TabsContent value="upload" className="space-y-2 mt-4">
                                    <Input
                                        id="image"
                                        name="image"
                                        type="file"
                                        accept="image/*"
                                        disabled={isSubmitting || isUploadingImage}
                                        onChange={handleImageChange}
                                        className="cursor-pointer"
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Upload gambar produk. Gambar akan diunggah ke ImageKit.
                                    </p>
                                </TabsContent>
                                <TabsContent value="url" className="space-y-2 mt-4">
                                    <Input
                                        id="image_url"
                                        name="image_url"
                                        type="url"
                                        value={imageUrlManual}
                                        onChange={(e) => handleImageUrlChange(e.target.value)}
                                        onBlur={handleImageUrlBlur}
                                        placeholder="https://example.com/image.jpg"
                                        disabled={isSubmitting}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Masukkan URL gambar produk. Pastikan URL valid dan dapat diakses.
                                    </p>
                                </TabsContent>
                            </Tabs>
                            {imageUrl && (
                                <ContextMenu>
                                    <ContextMenuTrigger asChild>
                                        <div className="relative group cursor-context-menu rounded-md border border-border overflow-hidden bg-muted/50 hover:bg-muted transition-colors">
                                            <div className="relative aspect-video w-full">
                                                <Image
                                                    src={imageUrl}
                                                    alt="Product preview"
                                                    fill
                                                    className="object-contain"
                                                    unoptimized
                                                />
                                                {isUploadingImage && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                                        <IconLoader className="size-6 animate-spin text-muted-foreground" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                                            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-2">
                                                <p className="text-xs text-white truncate">
                                                    Klik kanan untuk opsi
                                                </p>
                                            </div>
                                        </div>
                                    </ContextMenuTrigger>
                                    <ContextMenuContent>
                                        <ContextMenuItem
                                            onClick={() => window.open(imageUrl, "_blank")}
                                            disabled={isSubmitting || isUploadingImage}
                                        >
                                            Lihat Gambar
                                        </ContextMenuItem>
                                        <ContextMenuItem
                                            onClick={async () => {
                                                try {
                                                    await navigator.clipboard.writeText(imageUrl)
                                                    toast.success("URL gambar berhasil disalin")
                                                } catch (err) {
                                                    console.error("Failed to copy:", err)
                                                    toast.error("Gagal menyalin URL")
                                                }
                                            }}
                                            disabled={isSubmitting || isUploadingImage}
                                        >
                                            Salin URL Gambar
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem
                                            onClick={removeImage}
                                            disabled={isSubmitting || isUploadingImage}
                                            variant="destructive"
                                        >
                                            Hapus Gambar
                                        </ContextMenuItem>
                                        <ContextMenuSeparator />
                                        <ContextMenuItem disabled className="text-xs text-muted-foreground">
                                            Format: JPG, PNG, GIF
                                        </ContextMenuItem>
                                        <ContextMenuItem disabled className="text-xs text-muted-foreground">
                                            {imageInputMode === "upload" ? "Upload ke ImageKit" : "URL External"}
                                        </ContextMenuItem>
                                    </ContextMenuContent>
                                </ContextMenu>
                            )}
                        </div>
                        <FieldDescription>
                            {imageInputMode === "upload"
                                ? "Upload gambar produk (opsional). Gambar akan diunggah ke ImageKit."
                                : "Masukkan URL gambar produk (opsional). Pastikan URL valid dan dapat diakses."}
                            {imageUrl && " Klik kanan pada preview untuk opsi lebih lanjut."}
                        </FieldDescription>
                        {imageUrl && (
                            <p className="mt-2 text-xs text-muted-foreground break-all">
                                Image URL: {imageUrl}
                            </p>
                        )}
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="Deskripsi produk (opsional)"
                            disabled={isSubmitting}
                        />
                        <FieldDescription>Catatan/deskripsi produk (opsional).</FieldDescription>
                    </Field>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="price">Price</FieldLabel>
                            <Input
                                id="price"
                                type="text"
                                inputMode="numeric"
                                value={priceDisplay}
                                onChange={handlePriceChange}
                                onBlur={handlePriceBlur}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                            <input type="hidden" name="price" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="modal">Modal</FieldLabel>
                            <Input
                                id="modal"
                                type="text"
                                inputMode="numeric"
                                value={modalDisplay}
                                onChange={handleModalChange}
                                onBlur={handleModalBlur}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                            <input type="hidden" name="modal" />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="stock">Stock</FieldLabel>
                            <Input
                                id="stock"
                                type="text"
                                inputMode="numeric"
                                value={stockDisplay}
                                onChange={handleStockChange}
                                onBlur={handleStockBlur}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                            <input type="hidden" name="stock" />
                        </Field>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="min_stock">Min Stock</FieldLabel>
                            <Input
                                id="min_stock"
                                type="text"
                                inputMode="numeric"
                                value={minStockDisplay}
                                onChange={handleMinStockChange}
                                onBlur={handleMinStockBlur}
                                placeholder="0"
                                disabled={isSubmitting}
                            />
                            <input type="hidden" name="min_stock" />
                            <FieldDescription>Minimum stok sebelum dianggap menipis (opsional).</FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="size">Size</FieldLabel>
                            <Input
                                id="size"
                                type="text"
                                inputMode="numeric"
                                value={sizeDisplay}
                                onChange={handleSizeChange}
                                onBlur={handleSizeBlur}
                                placeholder="1, 2, 5 (liter/kg/meter)"
                                disabled={isSubmitting}
                            />
                            <FieldDescription>Ukuran per unit, mis. 1, 2, 5 (opsional).</FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="unit">Unit</FieldLabel>
                            <Select
                                value={unit || "__none__"}
                                onValueChange={(v) => setUnit(v === "__none__" ? "" : v)}
                                disabled={isSubmitting}
                            >
                                <SelectTrigger id="unit">
                                    <SelectValue placeholder="Pilih unit (opsional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="__none__">— Pilih unit —</SelectItem>
                                    <SelectItem value="pcs">pcs</SelectItem>
                                    <SelectItem value="kg">kg</SelectItem>
                                    <SelectItem value="liter">liter</SelectItem>
                                    <SelectItem value="meter">meter</SelectItem>
                                    <SelectItem value="pack">pack</SelectItem>
                                    <SelectItem value="dus">dus</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldDescription>Satuan produk (pcs, kg, liter, dll).</FieldDescription>
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

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <Field>
                            <FieldLabel htmlFor="supplier_id">Supplier</FieldLabel>
                            <Combobox
                                options={suppliers.map((supplier) => ({
                                    value: String(supplier.id),
                                    label: supplier.name,
                                }))}
                                value={supplierId}
                                onValueChange={setSupplierId}
                                placeholder={
                                    isLoadingSuppliers
                                        ? "Loading suppliers..."
                                        : "Select supplier (optional)"
                                }
                                searchPlaceholder="Cari supplier..."
                                emptyText="Tidak ada supplier ditemukan."
                                disabled={isSubmitting || isLoadingSuppliers}
                            />
                            <FieldDescription>
                                Pilih supplier untuk produk ini (opsional).
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="category_id">Category</FieldLabel>
                            <Combobox
                                options={categories.map((category) => ({
                                    value: String(category.id),
                                    label: category.name,
                                }))}
                                value={categoryId}
                                onValueChange={setCategoryId}
                                placeholder={
                                    isLoadingCategories
                                        ? "Loading categories..."
                                        : "Select category (optional)"
                                }
                                searchPlaceholder="Cari kategori..."
                                emptyText="Tidak ada kategori ditemukan."
                                disabled={isSubmitting || isLoadingCategories}
                            />
                            <FieldDescription>
                                Pilih kategori untuk produk ini (opsional).
                            </FieldDescription>
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="branch_id">Branch</FieldLabel>
                            <Combobox
                                options={[
                                    { value: NO_BRANCH_VALUE, label: "No Branch" },
                                    ...branches.map((branch) => ({
                                        value: branch.id,
                                        label: branch.name,
                                    })),
                                ]}
                                value={branchId || NO_BRANCH_VALUE}
                                onValueChange={(value) => setBranchId(value === NO_BRANCH_VALUE ? "" : value)}
                                placeholder={
                                    isLoadingBranches
                                        ? "Loading branches..."
                                        : "Select branch (optional)"
                                }
                                searchPlaceholder="Cari branch..."
                                emptyText="Tidak ada branch ditemukan."
                                disabled={isSubmitting || isLoadingBranches}
                            />
                            <FieldDescription>
                                Pilih branch untuk produk ini (opsional).
                            </FieldDescription>
                        </Field>
                    </div>
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

            <Dialog open={showScanDialog} onOpenChange={(open) => !open && stopScanning()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Scan Barcode</DialogTitle>
                        <DialogDescription>
                            Arahkan kamera ke barcode untuk memindainya. Pastikan izin kamera telah diberikan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div
                            id={scanElementId}
                            className="w-full rounded-lg border border-border overflow-hidden bg-muted/50"
                            style={{ minHeight: "300px" }}
                        />
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={stopScanning}
                                disabled={!isScanning}
                            >
                                Tutup
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    )
}
