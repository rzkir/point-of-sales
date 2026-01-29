"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"

import { useRouter } from "next/navigation"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getInitialUser(): User | null {
    if (typeof window === "undefined") return null

    try {
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
            return JSON.parse(storedUser)
        }
    } catch (err) {
        console.error("Error parsing stored user:", err)
        localStorage.removeItem("user")
    }
    return null
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(getInitialUser)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    // Sinkronkan cookie user.role agar proxy bisa redirect / → /dashboard
    useEffect(() => {
        if (user && typeof window !== "undefined") {
            document.cookie = `user.role=${encodeURIComponent(user.roleType)}; path=/; max-age=604800`
        }
    }, [user])

    const login = async (credentials: LoginRequest): Promise<User | null> => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(credentials),
            })

            // Parse response
            let data: AuthResponse
            try {
                data = await response.json()
            } catch {
                // Jika response bukan JSON
                setError(`Server error: ${response.status} ${response.statusText}`)
                setIsLoading(false)
                return null
            }

            if (!data.success || !data.data) {
                setError(data.message || "Login failed")
                setIsLoading(false)
                return null
            }

            // Save user to state and localStorage
            setUser(data.data)
            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(data.data))
                // Cookie untuk proxy: redirect / → /dashboard jika role admin, / → /karyawan jika role karyawan
                document.cookie = `user.role=${encodeURIComponent(data.data.roleType)}; path=/; max-age=604800`

                // Redirect berdasarkan role setelah login
                if (data.data.roleType === "karyawan") {
                    router.push("/karyawan")
                } else if (data.data.roleType === "super_admin" || data.data.roleType === "admin") {
                    router.push("/dashboard")
                }
            }

            setIsLoading(false)
            return data.data
        } catch (error) {
            console.error("Login error:", error)
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
            setIsLoading(false)
            return null
        }
    }

    const register = async (data: RegisterRequest): Promise<boolean> => {
        setIsLoading(true)
        setError(null)

        try {
            console.log("Register: Sending request with data:", {
                email: data.email,
                name: data.name,
                hasPassword: !!data.password,
                hasConfirmPassword: !!data.confirmPassword
            })

            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            })

            console.log("Register: Response status:", response.status, response.statusText)

            // Parse response
            let result: AuthResponse
            try {
                result = await response.json()
                console.log("Register: Parsed response:", result)
            } catch (parseError) {
                // Jika response bukan JSON
                const errorMsg = `Server error: ${response.status} ${response.statusText}`
                console.error("Register: Failed to parse response:", parseError)
                setError(errorMsg)
                setIsLoading(false)
                return false
            }

            if (!result.success) {
                const errorMsg = result.message || "Registration failed"
                console.log("Register: Registration failed:", errorMsg)
                setError(errorMsg)
                setIsLoading(false)
                return false
            }

            console.log("Register: Success!")
            setIsLoading(false)
            return true
        } catch (error) {
            console.error("Register: Exception occurred:", error)
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
            setIsLoading(false)
            return false
        }
    }

    const logout = async () => {
        setUser(null)
        if (typeof window !== "undefined") {
            localStorage.removeItem("user")
            await fetch("/api/auth/session", { method: "DELETE", credentials: "include" })
        }
        router.push("/")
    }

    const clearError = () => {
        setError(null)
    }

    const updateUser = async (updatedData: Partial<User>): Promise<User | null> => {
        if (!user) return null

        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch("/api/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`,
                },
                body: JSON.stringify({
                    id: user.id,
                    ...updatedData,
                }),
            })

            let data: AuthResponse
            try {
                data = await response.json()
            } catch {
                setError(`Server error: ${response.status} ${response.statusText}`)
                setIsLoading(false)
                return null
            }

            if (!data.success || !data.data) {
                setError(data.message || "Update failed")
                setIsLoading(false)
                return null
            }

            // Update user in state and localStorage
            setUser(data.data)
            if (typeof window !== "undefined") {
                localStorage.setItem("user", JSON.stringify(data.data))
            }

            setIsLoading(false)
            return data.data
        } catch (error) {
            console.error("Update user error:", error)
            setError(error instanceof Error ? error.message : "An error occurred. Please try again.")
            setIsLoading(false)
            return null
        }
    }

    const value: AuthContextType = {
        user,
        isLoading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        clearError,
        updateUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}
