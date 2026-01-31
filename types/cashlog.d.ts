interface CashLog {
    id: string;
    date: string;
    amount: number;
    cashier_name: string;
    branch_name: string;
    status: "pending" | "approved" | "rejected";
    approved_by?: string;
    approved_at?: string;
    type: "opening_cash" | "closing_cash";
    created_at: string;
    updated_at: string;
}

type CashLogRow = CashLog;

type CashLogsResponse = {
    success: boolean;
    message?: string;
    data: CashLogRow[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
};

type CreateCashLogPayload = {
    date: string;
    amount: number;
    cashier_name: string;
    branch_name: string;
    type: "opening_cash" | "closing_cash";
};

interface UseCreateCashLogProps {
    onUpdate: () => void;
    user?: User | null;
}

interface UseEditCashLogProps {
    onUpdate: () => void;
}