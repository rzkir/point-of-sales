enum RoleType {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    KARYAWAN = "karyawan",
}

interface User {
    id: string;
    email: string;
    name: string;
    roleType: RoleType;
    branchId: string;
    createdAt: string;
    updatedAt: string;
}

interface Accounts {
    id: string;
    email: string;
    name: string;
    password: string;
    roleType: RoleType;
    branchId: string;
    createdAt: string;
    updatedAt: string;
}

interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
    roleType?: RoleType;
    branchId?: string;
}

interface LoginRequest {
    email?: string;
    name?: string;
    password: string;
}

interface AuthResponse {
    success: boolean;
    message: string;
    data?: User;
}

interface AuthContextType {
    user: User | null
    isLoading: boolean
    error: string | null
    login: (credentials: LoginRequest) => Promise<User | null>
    register: (data: RegisterRequest) => Promise<boolean>
    logout: () => void | Promise<void>
    isAuthenticated: boolean
    clearError: () => void
}
