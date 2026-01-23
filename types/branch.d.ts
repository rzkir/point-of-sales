interface Branch {
    id: string
    name: string
    address: string
    createdAt: string
    updatedAt: string
}

type BranchRow = {
    id: string
    name: string
    address?: string
    createdAt?: string
    updatedAt?: string
}

type BranchesResponse = {
    success: boolean
    message?: string
    data: BranchRow[]
}

type BranchResponse = {
    success: boolean
    message?: string
    data: BranchRow
}

type DeleteBranchResponse = {
    success: boolean
    message?: string
}

interface BranchModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    branch: BranchRow | null
    isLoading: boolean
}

interface BranchEditFormProps {
    branch: Branch
    onUpdate: () => void
    children: React.ReactElement
}

interface DeleteBranchProps {
    branch: BranchRow
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

interface UseCreateBranchProps {
    onUpdate: () => void
}

interface UseDeleteBranchProps {
    branchId: string | number
    onUpdate: () => void
    onOpenChange: (open: boolean) => void
}

interface UseEditBranchProps {
    branchId: string | number
    onUpdate: () => void
}