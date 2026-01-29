"use client"

import React from "react"
import {
    IconUser,
    IconMail,
    IconShield,
    IconBuilding,
    IconCalendar,
    IconEdit,
    IconCheck,
    IconX,
    IconPhoto,
    IconLoader,
    IconKey,
} from "@tabler/icons-react"

import { useAuth } from "@/context/AuthContext"
import { formatDate } from "@/lib/format-date"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { CardSkeleton } from "../AppSkelaton"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

function getRoleLabel(roleType: string): string {
    const roleMap: Record<string, string> = {
        super_admin: "Super Admin",
        admin: "Admin",
        karyawan: "Karyawan",
    }
    return roleMap[roleType] || roleType
}

function getRoleVariant(roleType: string): "default" | "secondary" | "destructive" | "outline" {
    if (roleType === "super_admin") return "destructive"
    if (roleType === "admin") return "default"
    return "secondary"
}

export default function Profile() {
    const { user, isLoading, updateUser } = useAuth()
    const [mounted, setMounted] = React.useState(false)
    const [isEditing, setIsEditing] = React.useState(false)
    const [editedName, setEditedName] = React.useState("")
    const [editedEmail, setEditedEmail] = React.useState("")
    const [isUploadingAvatar, setIsUploadingAvatar] = React.useState(false)
    const [isSaving, setIsSaving] = React.useState(false)
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const [currentPassword, setCurrentPassword] = React.useState("")
    const [newPassword, setNewPassword] = React.useState("")
    const [confirmNewPassword, setConfirmNewPassword] = React.useState("")
    const [isChangingPassword, setIsChangingPassword] = React.useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    React.useEffect(() => {
        if (user) {
            setEditedName(user.name)
            setEditedEmail(user.email)
        }
    }, [user])

    const handleAvatarClick = () => {
        fileInputRef.current?.click()
    }

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast.error("File harus berupa gambar")
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("Ukuran file maksimal 5MB")
            return
        }

        setIsUploadingAvatar(true)
        try {
            const formData = new FormData()
            formData.append("file", file)

            const response = await fetch("/api/profile/upload", {
                method: "POST",
                headers: {
                    // IMPORTANT: jangan set Content-Type manual untuk FormData
                    // biar browser otomatis menambahkan boundary.
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET || ""}`,
                },
                body: formData,
            })

            const data = await response.json()
            if (!response.ok || !data.url) {
                throw new Error(data.error || data.message || "Failed to upload avatar")
            }

            // Update user with new avatar URL
            const updatedUser = await updateUser({ avatar: data.url })
            if (updatedUser) {
                toast.success("Avatar berhasil diunggah")
            }
        } catch (error) {
            console.error("Upload avatar error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal mengunggah avatar")
        } finally {
            setIsUploadingAvatar(false)
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = ""
            }
        }
    }

    const handleSave = async () => {
        if (!user) return

        // Validate inputs
        if (!editedName.trim()) {
            toast.error("Nama tidak boleh kosong")
            return
        }

        if (!editedEmail.trim()) {
            toast.error("Email tidak boleh kosong")
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(editedEmail.trim())) {
            toast.error("Format email tidak valid")
            return
        }

        setIsSaving(true)
        try {
            const updatedUser = await updateUser({
                name: editedName.trim(),
                email: editedEmail.trim(),
            })

            if (updatedUser) {
                toast.success("Profile berhasil diperbarui")
                setIsEditing(false)
            }
        } catch (error) {
            console.error("Update profile error:", error)
            toast.error("Gagal memperbarui profile")
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        if (user) {
            setEditedName(user.name)
            setEditedEmail(user.email)
        }
        setIsEditing(false)
    }

    const handleChangePassword = async () => {
        if (!user) return

        if (!currentPassword.trim()) {
            toast.error("Password lama tidak boleh kosong")
            return
        }
        if (!newPassword.trim()) {
            toast.error("Password baru tidak boleh kosong")
            return
        }
        if (newPassword.trim().length < 8) {
            toast.error("Password baru minimal 8 karakter")
            return
        }
        if (newPassword !== confirmNewPassword) {
            toast.error("Konfirmasi password baru tidak sama")
            return
        }
        if (currentPassword === newPassword) {
            toast.error("Password baru harus berbeda dengan password lama")
            return
        }

        setIsChangingPassword(true)
        try {
            const response = await fetch("/api/profile/password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET || ""}`,
                },
                body: JSON.stringify({
                    id: user.id,
                    currentPassword,
                    newPassword,
                }),
            })

            const data = await response.json().catch(() => null)
            if (!response.ok || !data?.success) {
                throw new Error(data?.message || "Gagal mengganti password")
            }

            toast.success("Password berhasil diperbarui")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
            setIsPasswordModalOpen(false)
        } catch (error) {
            console.error("Change password error:", error)
            toast.error(error instanceof Error ? error.message : "Gagal mengganti password")
        } finally {
            setIsChangingPassword(false)
        }
    }

    const handleClosePasswordModal = () => {
        if (!isChangingPassword) {
            setIsPasswordModalOpen(false)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmNewPassword("")
        }
    }

    // Avoid hydration mismatch: server render (no localStorage user) vs client render
    if (!mounted) {
        return (
            <section className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-8 sm:px-6">
                <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <Skeleton className="size-16 rounded-full sm:size-20" />
                            </div>
                            <div className="w-full flex-1 space-y-3 text-center sm:text-left">
                                <Skeleton className="mx-auto h-9 w-56 sm:mx-0" />
                                <Skeleton className="mx-auto h-5 w-72 sm:mx-0" />
                                <Skeleton className="mx-auto h-4 w-40 sm:mx-0" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                    <CardSkeleton count={2} />
                </div>
            </section>
        )
    }

    if (isLoading || !user) {
        return (
            <section className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-8 sm:px-6">
                <Card className="overflow-hidden rounded-xl border bg-card shadow-sm">
                    <CardContent className="p-6 sm:p-8">
                        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4 sm:gap-5">
                                <Skeleton className="size-16 rounded-full sm:size-20" />
                            </div>
                            <div className="w-full flex-1 space-y-3 text-center sm:text-left">
                                <Skeleton className="mx-auto h-9 w-56 sm:mx-0" />
                                <Skeleton className="mx-auto h-5 w-72 sm:mx-0" />
                                <Skeleton className="mx-auto h-4 w-40 sm:mx-0" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="grid gap-6 md:grid-cols-2">
                    <CardSkeleton count={2} />
                </div>
            </section>
        )
    }

    return (
        <section className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-8 sm:px-6">
            {/* Header / Hero */}
            <Card className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
                <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-primary/8 via-transparent to-transparent" />
                <CardContent className="relative p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <Avatar
                                    className="size-20 cursor-pointer select-none rounded-full ring-2 ring-border shadow-sm transition hover:shadow-md sm:size-24"
                                    onClick={handleAvatarClick}
                                >
                                    <AvatarImage src={user.avatar || ""} alt={user.name} />
                                    <AvatarFallback className="text-xl font-semibold bg-muted text-foreground sm:text-2xl">
                                        {getInitials(user.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <button
                                    type="button"
                                    onClick={handleAvatarClick}
                                    disabled={isUploadingAvatar}
                                    className="absolute -bottom-1 -right-1 inline-flex size-9 items-center justify-center rounded-full border bg-background shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
                                    aria-label="Ubah foto profil"
                                >
                                    {isUploadingAvatar ? (
                                        <IconLoader className="size-4 animate-spin" />
                                    ) : (
                                        <IconPhoto className="size-4" />
                                    )}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    disabled={isUploadingAvatar}
                                />
                            </div>

                            {/* Main identity */}
                            <div className="space-y-1 text-center sm:text-left">
                                <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                                    <h1 className="text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
                                        {user.name}
                                    </h1>
                                    <Badge variant={getRoleVariant(user.roleType)} className="w-fit">
                                        <IconShield className="size-3" />
                                        {getRoleLabel(user.roleType)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground flex items-center justify-center gap-2 sm:justify-start">
                                    <IconMail className="size-4" />
                                    <span className="truncate">{user.email}</span>
                                </p>
                                <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground sm:justify-start">
                                    {user.branchName && (
                                        <div className="inline-flex items-center gap-2">
                                            <IconBuilding className="size-4" />
                                            <span>{user.branchName}</span>
                                        </div>
                                    )}
                                    <div className="inline-flex items-center gap-2">
                                        <IconCalendar className="size-4" />
                                        <span>Bergabung {formatDate(user.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick action */}
                        <div className="flex items-center justify-center gap-2 sm:justify-end">
                            {!isEditing ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="gap-2"
                                >
                                    <IconEdit className="size-4" />
                                    Edit Profile
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground text-center sm:text-left">
                        Klik foto untuk mengubah avatar. Ukuran maksimal 5MB.
                    </p>
                </CardContent>
            </Card>

            {/* Information Cards */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <Card className="rounded-xl border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <IconUser className="size-5" />
                                    Informasi Pribadi
                                </CardTitle>
                                <CardDescription>
                                    Detail informasi akun Anda
                                </CardDescription>
                            </div>
                            {!isEditing ? (
                                <Button
                                    variant="ghost"
                                    size="icon-sm"
                                    onClick={() => setIsEditing(true)}
                                    className="shrink-0"
                                    aria-label="Edit profile"
                                >
                                    <IconEdit className="size-4" />
                                </Button>
                            ) : null}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-2">
                        {isEditing ? (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama</Label>
                                    <Input
                                        id="name"
                                        value={editedName}
                                        onChange={(e) =>
                                            setEditedName(e.target.value)
                                        }
                                        placeholder="Masukkan nama"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={editedEmail}
                                        onChange={(e) =>
                                            setEditedEmail(e.target.value)
                                        }
                                        placeholder="Masukkan email"
                                    />
                                </div>
                                <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
                                    <Button
                                        onClick={handleSave}
                                        size="sm"
                                        className="flex-1 gap-2"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <>
                                                <IconLoader className="size-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <IconCheck className="size-4" />
                                                Simpan
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 gap-2"
                                        disabled={isSaving}
                                    >
                                        <IconX className="size-4" />
                                        Batal
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rounded-lg border bg-muted/20 px-4 py-3">
                                    <Label className="text-muted-foreground text-xs">
                                        Nama Lengkap
                                    </Label>
                                    <p className="mt-1 text-sm font-medium">
                                        {user.name}
                                    </p>
                                </div>
                                <div className="rounded-lg border bg-muted/20 px-4 py-3">
                                    <Label className="text-muted-foreground text-xs">
                                        Email
                                    </Label>
                                    <p className="mt-1 text-sm font-medium break-all">
                                        {user.email}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Account Details */}
                <Card className="rounded-xl border bg-card shadow-sm">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <IconShield className="size-5" />
                            Detail Akun
                        </CardTitle>
                        <CardDescription>
                            Informasi tentang akun dan keanggotaan Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-2">
                        <div className="rounded-lg border bg-muted/20 px-4 py-3">
                            <Label className="text-muted-foreground text-xs">Role</Label>
                            <div className="mt-1">
                                <Badge variant={getRoleVariant(user.roleType)} className="w-fit">
                                    <IconShield className="size-3" />
                                    {getRoleLabel(user.roleType)}
                                </Badge>
                            </div>
                        </div>
                        {user.branchName && (
                            <div className="rounded-lg border bg-muted/20 px-4 py-3">
                                <Label className="text-muted-foreground text-xs flex items-center gap-2">
                                    <IconBuilding className="size-4" />
                                    Cabang
                                </Label>
                                <p className="mt-1 text-sm font-medium">
                                    {user.branchName}
                                </p>
                            </div>
                        )}
                        <div className="rounded-lg border bg-muted/20 px-4 py-3">
                            <Label className="text-muted-foreground text-xs flex items-center gap-2">
                                <IconCalendar className="size-4" />
                                Bergabung Sejak
                            </Label>
                            <p className="mt-1 text-sm font-medium">
                                {formatDate(user.createdAt)}
                            </p>
                        </div>
                        <div className="rounded-lg border bg-muted/20 px-4 py-3">
                            <Label className="text-muted-foreground text-xs">Terakhir Diperbarui</Label>
                            <p className="mt-1 text-sm font-medium">
                                {formatDate(user.updatedAt)}
                            </p>
                        </div>
                        <div className="pt-2">
                            <Button
                                variant="outline"
                                className="w-full gap-2"
                                onClick={() => setIsPasswordModalOpen(true)}
                            >
                                <IconKey className="size-4" />
                                Ubah Password
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Change Password Modal */}
            <Dialog open={isPasswordModalOpen} onOpenChange={handleClosePasswordModal}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <IconKey className="size-5" />
                            Ubah Password
                        </DialogTitle>
                        <DialogDescription>
                            Gunakan password yang kuat dan jangan bagikan ke siapa pun
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="modal-current-password">Password Lama</Label>
                            <Input
                                id="modal-current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="Masukkan password lama"
                                autoComplete="current-password"
                                disabled={isChangingPassword}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="modal-new-password">Password Baru</Label>
                                <Input
                                    id="modal-new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimal 8 karakter"
                                    autoComplete="new-password"
                                    disabled={isChangingPassword}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="modal-confirm-new-password">Konfirmasi Password Baru</Label>
                                <Input
                                    id="modal-confirm-new-password"
                                    type="password"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    placeholder="Ulangi password baru"
                                    autoComplete="new-password"
                                    disabled={isChangingPassword}
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={handleClosePasswordModal}
                            disabled={isChangingPassword}
                            className="gap-2"
                        >
                            <IconX className="size-4" />
                            Batal
                        </Button>
                        <Button onClick={handleChangePassword} disabled={isChangingPassword} className="gap-2">
                            {isChangingPassword ? (
                                <>
                                    <IconLoader className="size-4 animate-spin" />
                                    Memperbarui...
                                </>
                            ) : (
                                <>
                                    <IconCheck className="size-4" />
                                    Simpan Password
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    )
}
