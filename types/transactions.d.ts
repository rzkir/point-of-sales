interface Transaction {
    id: number;
    transaction_number: string;

    // Customer (wajib jika kasbon)
    customer_name?: string;

    // Financial
    subtotal: number;
    discount: number;
    tax: number;
    total: number;

    paid_amount: number;     // jumlah yang sudah dibayar
    due_amount: number;      // sisa yang belum dibayar
    is_credit: boolean;      // true = kasbon

    // Payment
    payment_method: "cash";
    payment_status: "paid" | "unpaid" | "partial";

    // Transaction lifecycle
    status: "pending" | "completed" | "cancelled" | "return";

    // Branch & audit
    branch_name: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

type TransactionRow = Transaction;

type TransactionsResponse = {
    success: boolean;
    message?: string;
    data: TransactionRow[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};