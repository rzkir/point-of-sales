
type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

type ApiRoute = {
    path: string;
    methods: ApiMethod[];
    auth?: "Bearer" | "Cookie" | "None";
    notes?: string;
    description?: string;
    example?: {
        title: string;
        curl: string;
    };
};

type ApiResponse = {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: unknown;
    error?: string;
};