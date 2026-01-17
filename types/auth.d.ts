export enum RoleType {
    SUPER_ADMIN = "super_admin",
    ADMIN = "admin",
    KARYAWAN = "karyawan",
}

export interface User {
    id: string;
    email: string;
    name: string;
    roleType: RoleType;
    branchId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Accounts {
    id: string;
    email: string;
    name: string;
    password: string;
    roleType: RoleType;
    branchId: string;
    createdAt: string;
    updatedAt: string;
}

export interface RegisterRequest {
    email: string;
    name: string;
    password: string;
    confirmPassword: string;
    roleType?: RoleType;
    branchId?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: User;
}