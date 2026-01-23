interface Category {
    id: string
    uid: string
    name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

type CategoryRow = {
    id: string
    uid?: string
    name: string
    is_active?: boolean
    created_at?: string
    updated_at?: string
}

type CategoriesResponse = {
    success: boolean
    message?: string
    data: CategoryRow[]
}

type DeleteCategoryResponse = {
    success: boolean
    message?: string
}

interface UseCreateCategoryProps {
    onUpdate: () => void
}

interface UseEditCategoryProps {
    categoryId: string | number
    onUpdate: () => void
    initialIsActive?: boolean
}

interface UseDeleteCategoryProps {
    categoryId: string | number
    onUpdate: () => void
    onOpenChange: (open: boolean) => void
}

interface CategoryEditFormProps {
    category: CategoryRow
    onUpdate: () => void
    children: React.ReactElement
}

interface DeleteCategoryProps {
    category: CategoryRow
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}
