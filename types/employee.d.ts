interface Employee {
    id: string
    name: string
    email: string
    roleType: string
    branchId?: string
    branchName?: string
    createdAt: string
    updatedAt: string
}

type EmployeeRow = {
    id: string
    name: string
    email?: string
    roleType?: string
    branchName?: string
    createdAt?: string
    updatedAt?: string
}

type EmployeesResponse = {
    success: boolean
    message?: string
    data: EmployeeRow[]
}

type DeleteEmployeeResponse = {
    success: boolean
    message?: string
}

interface DeleteEmployeeProps {
    employee: Employee
    onUpdate: () => void
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

interface EmployeeEditFormProps {
    employee: Employee
    onUpdate: () => void
    children: React.ReactElement
}