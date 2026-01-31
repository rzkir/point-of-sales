interface Transaction {
    id: number;
    transaction_number: string;

    // Customer (wajib jika kasbon)
    customer_name?: string;

    // Financial
    subtotal: number;
    discount: number;
    total: number;

    paid_amount: number;     // jumlah yang sudah dibayar
    due_amount: number;      // sisa yang belum dibayar
    is_credit: boolean;      // true = kasbon

    // Payment
    payment_method: "cash";
    payment_status: "paid" | "unpaid" | "partial";
    items?: string | Array<{
        product_id?: string | number;
        product_name: string;
        image_url?: string;
        quantity: number;
        price: number;
        subtotal?: number;
        unit?: string;
    }>; // JSON string or array from API

    // Transaction lifecycle
    status: "pending" | "completed" | "cancelled" | "return";

    // Branch & audit
    branch_name: string;
    created_by?: string;
    created_at: string;
    updated_at: string;
}

interface TransactionItem {
    id?: number | string;
    transaction_id: string | number;
    product_id: string | number;
    product_name: string;
    image_url?: string;
    quantity: number;
    price: number;
    subtotal: number;
    unit?: string;
    created_at?: string;
    updated_at?: string;
}

type TransactionItemRow = TransactionItem;

type TransactionItemsResponse = {
    success: boolean;
    message?: string;
    data: TransactionItemRow[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};

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

type TransactionRow = Transaction;
