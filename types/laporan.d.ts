interface StoreExpense {
    id: string;
    date: string;
    category: "operasional" | "listrik" | "air" | "pembelian" | "lainnya";
    amount: number;
    description?: string;
    branch_name: string;
    cashier_name: string;
    approved_by?: string;
    receipt_url?: string;
    status: "pending" | "approved" | "rejected";
    created_at: string;
    updated_at: string;
}

type StoreExpenseRow = StoreExpense;

type LaporanResponse = {
    success: boolean;
    message?: string;
    data: StoreExpenseRow[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};

type CreateStoreExpensePayload = {
    date: string;
    category: StoreExpense["category"];
    amount: number;
    description?: string;
    branch_name: string;
};