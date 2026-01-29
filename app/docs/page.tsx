"use client";

import * as React from "react";
import { Menu } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet";

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

const API_ROUTES: ApiRoute[] = [
    {
        path: "/api/auth/register",
        methods: ["POST"],
        auth: "None",
        description: "Daftar user baru via Apps Script.",
        notes: "Body JSON berisi `email`, `name`, dan `password`.",
        example: {
            title: "Register",
            curl: `curl -X POST "${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/register" \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"user@mail.com","name":"User","password":"secret"}'`,
        },
    },
    {
        path: "/api/auth/login",
        methods: ["POST"],
        auth: "None",
        description: "Login dan set cookie `session`. Bisa pakai `email` atau `name`.",
        notes: "Jika berhasil, server akan meng-set cookie `session` yang dipakai oleh endpoint lain.",
        example: {
            title: "Login (set cookie session)",
            curl: `curl -i -X POST "${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/login" \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"user@mail.com","password":"secret"}'`,
        },
    },
    {
        path: "/api/auth/session",
        methods: ["GET", "DELETE"],
        auth: "Cookie",
        description: "Cek session aktif atau logout.",
        notes: "`GET` membaca cookie `session`, `DELETE` menghapus cookie `session` dan `user.role`.",
        example: {
            title: "Get session",
            curl: `curl -X GET "${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session" \\\n  -H "Cookie: session=<paste-cookie-value-here>"`,
        },
    },

    { path: "/api/products", methods: ["GET", "POST"], auth: "Bearer", description: "List & create products.", notes: "`GET` mendukung query `page`, `limit`, `branch_name`, `category_id`, `category_name`, `supplier_name`, `search`." },
    { path: "/api/products/[id]", methods: ["GET", "PUT", "DELETE"], auth: "None", description: "Get, update, dan delete product by id.", notes: "Perhatikan: file ini tidak memakai `checkAuth`, tapi tetap meneruskan request ke Apps Script." },
    { path: "/api/products/upload", methods: ["POST"], auth: "None", description: "Upload gambar/asset product.", notes: "Biasanya dipakai bersamaan dengan create/update product." },

    { path: "/api/karyawan", methods: ["POST"], auth: "Bearer", description: "Endpoint internal untuk role karyawan." },
    { path: "/api/karyawan/products", methods: ["GET"], auth: "Bearer", description: "List products untuk karyawan." },
    { path: "/api/karyawan/products/[id]", methods: ["GET"], auth: "Bearer", description: "Detail product untuk karyawan." },
    { path: "/api/karyawan/products/search", methods: ["GET"], auth: "Bearer", description: "Search product untuk karyawan.", notes: "Query pencarian tergantung implementasi (mis. `search` atau `q`)." },
    {
        path: "/api/karyawan/products/popular",
        methods: ["GET"],
        auth: "Bearer",
        description: "Popular products by branch.",
        notes: "Wajib query `branch_name`, opsional `limit` (default 10, max 100).",
        example: {
            title: "Popular products",
            curl: `curl -X GET "${process.env.NEXT_PUBLIC_BASE_URL}/api/karyawan/products/popular?branch_name=Langgeng%20Jaya%201&limit=10" \\\n  -H "Authorization: Bearer <NEXT_PUBLIC_API_SECRET>"`,
        },
    },
    { path: "/api/karyawan/transaction", methods: ["GET"], auth: "Bearer", description: "Transaksi (karyawan) via Apps Script." },

    { path: "/api/branches", methods: ["GET", "POST"], auth: "None", description: "Branches CRUD (list/create)." },
    { path: "/api/branches/[id]", methods: ["GET", "PUT", "DELETE"], auth: "None", description: "Branch by id." },

    { path: "/api/categories", methods: ["GET", "POST"], auth: "None", description: "Categories CRUD (list/create)." },
    { path: "/api/categories/[id]", methods: ["GET", "PUT", "DELETE"], auth: "None", description: "Category by id." },

    { path: "/api/employees", methods: ["GET", "POST"], auth: "None", description: "Employees list/create." },
    { path: "/api/employees/[id]", methods: ["GET", "PUT", "DELETE"], auth: "Bearer", description: "Employee by id.", notes: "Route ini memakai `checkAuth`." },

    { path: "/api/supplier", methods: ["GET", "POST"], auth: "None", description: "Supplier list/create." },
    { path: "/api/supplier/[id]", methods: ["GET", "PUT", "DELETE"], auth: "None", description: "Supplier by id." },

    { path: "/api/transactions", methods: ["GET", "POST"], auth: "Bearer", description: "Transactions list/create.", notes: "Route ini memakai `checkAuth`." },
    { path: "/api/transactions/[id]", methods: ["GET", "PUT", "DELETE"], auth: "Bearer", description: "Transaction by id.", notes: "Route ini memakai `checkAuth`." },

    { path: "/api/profile", methods: ["GET", "PUT"], auth: "Bearer", description: "Get/update profile.", notes: "Route ini memakai `checkAuth`." },
    { path: "/api/profile/password", methods: ["POST"], auth: "Bearer", description: "Update password.", notes: "Route ini memakai `checkAuth`." },
    { path: "/api/profile/upload", methods: ["POST"], auth: "None", description: "Upload foto/profile asset." },
];

function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
            {children}
        </span>
    );
}

function highlightJSON(code: string): React.ReactNode {
    try {
        // Verify it's valid JSON
        JSON.parse(code);

        // Use a simpler approach: replace JSON patterns with highlighted spans
        const parts: Array<{ start: number; end: number; type: 'key' | 'string' | 'number' | 'boolean' | 'null' }> = [];

        // Find all JSON strings (keys and values)
        const stringRegex = /"([^"\\]|\\.)*"/g;
        let match;
        while ((match = stringRegex.exec(code)) !== null) {
            // Check if it's a key (followed by :)
            const afterMatch = code.substring(match.index + match[0].length).trim();
            if (afterMatch.startsWith(':')) {
                parts.push({ start: match.index, end: match.index + match[0].length, type: 'key' });
            } else {
                parts.push({ start: match.index, end: match.index + match[0].length, type: 'string' });
            }
        }

        // Find numbers (not inside strings)
        const numberRegex = /\b(-?\d+\.?\d*)\b/g;
        while ((match = numberRegex.exec(code)) !== null) {
            const isInsideString = parts.some(p => match!.index >= p.start && match!.index < p.end);
            if (!isInsideString) {
                parts.push({ start: match.index, end: match.index + match[0].length, type: 'number' });
            }
        }

        // Find booleans and null (not inside strings)
        const keywordRegex = /\b(true|false|null)\b/g;
        while ((match = keywordRegex.exec(code)) !== null) {
            const isInsideString = parts.some(p => match!.index >= p.start && match!.index < p.end);
            if (!isInsideString) {
                if (match[0] === 'null') {
                    parts.push({ start: match.index, end: match.index + match[0].length, type: 'null' });
                } else {
                    parts.push({ start: match.index, end: match.index + match[0].length, type: 'boolean' });
                }
            }
        }

        // Sort parts by position
        parts.sort((a, b) => a.start - b.start);

        // Build React elements
        const elements: React.ReactNode[] = [];
        let lastIndex = 0;

        parts.forEach((part, idx) => {
            // Add text before this part
            if (part.start > lastIndex) {
                const beforeText = code.substring(lastIndex, part.start);
                // Split by punctuation to highlight them, but preserve all characters
                const segments = beforeText.split(/([\{\}\[\]\:\,])/);
                segments.forEach((seg, segIdx) => {
                    if (seg.match(/[\{\}\[\]\:\,]/)) {
                        elements.push(
                            <span key={`punct-${idx}-${segIdx}`} className="text-foreground">{seg}</span>
                        );
                    } else {
                        // Preserve whitespace and newlines
                        elements.push(
                            <span key={`text-${idx}-${segIdx}`} className="text-foreground">{seg}</span>
                        );
                    }
                });
            }

            // Add the highlighted part
            const partText = code.substring(part.start, part.end);
            const className =
                part.type === 'key' ? 'text-blue-600 dark:text-blue-400' :
                    part.type === 'string' ? 'text-emerald-600 dark:text-emerald-400' :
                        part.type === 'number' ? 'text-amber-600 dark:text-amber-400' :
                            part.type === 'boolean' ? 'text-purple-600 dark:text-purple-400' :
                                'text-gray-500 dark:text-gray-400';

            elements.push(
                <span key={`part-${idx}`} className={className}>{partText}</span>
            );

            lastIndex = part.end;
        });

        // Add remaining text
        if (lastIndex < code.length) {
            const remaining = code.substring(lastIndex);
            const segments = remaining.split(/([\{\}\[\]\:\,])/);
            segments.forEach((seg, segIdx) => {
                if (seg.match(/[\{\}\[\]\:\,]/)) {
                    elements.push(
                        <span key={`punct-end-${segIdx}`} className="text-foreground">{seg}</span>
                    );
                } else {
                    // Preserve whitespace and newlines
                    elements.push(
                        <span key={`text-end-${segIdx}`} className="text-foreground">{seg}</span>
                    );
                }
            });
        }

        return <>{elements}</>;
    } catch {
        // Not valid JSON, return as plain text
        return <span className="text-foreground">{code}</span>;
    }
}

function JsonViewer({
    value,
    path = "$",
}: {
    value: unknown;
    path?: string;
}) {
    const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

    const toggle = (p: string) => {
        setCollapsed((prev) => ({ ...prev, [p]: !prev[p] }));
    };

    const isCollapsed = (p: string) => Boolean(collapsed[p]);

    const renderNode = (v: unknown, p: string, indent: number): React.ReactNode => {
        const pad = " ".repeat(indent);

        if (v === null) return <span className="text-gray-500 dark:text-gray-400">null</span>;
        if (typeof v === "boolean") return <span className="text-purple-600 dark:text-purple-400">{String(v)}</span>;
        if (typeof v === "number") return <span className="text-amber-600 dark:text-amber-400">{String(v)}</span>;
        if (typeof v === "string") return <span className="text-emerald-600 dark:text-emerald-400">{JSON.stringify(v)}</span>;

        if (Array.isArray(v)) {
            const open = <span className="text-foreground">[</span>;
            const close = <span className="text-foreground">]</span>;
            const count = v.length;

            if (count === 0) return <>{open}{close}</>;

            if (isCollapsed(p)) {
                return (
                    <>
                        <button
                            type="button"
                            onClick={() => toggle(p)}
                            className="mr-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground hover:bg-accent hover:text-accent-foreground align-middle"
                            title="Expand array"
                        >
                            +
                        </button>
                        {open}
                        <span className="text-muted-foreground">… {count} items …</span>
                        {close}
                    </>
                );
            }

            return (
                <>
                    <button
                        type="button"
                        onClick={() => toggle(p)}
                        className="mr-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground hover:bg-accent hover:text-accent-foreground align-middle"
                        title="Collapse array"
                    >
                        −
                    </button>
                    {open}
                    {"\n"}
                    {v.map((item, idx) => {
                        const childPath = `${p}[${idx}]`;
                        return (
                            <React.Fragment key={childPath}>
                                {pad}
                                {"  "}
                                {renderNode(item, childPath, indent + 2)}
                                {idx < v.length - 1 ? <span className="text-foreground">,</span> : null}
                                {"\n"}
                            </React.Fragment>
                        );
                    })}
                    {pad}
                    {close}
                </>
            );
        }

        if (typeof v === "object" && v) {
            const obj = v as Record<string, unknown>;
            const keys = Object.keys(obj);
            const open = <span className="text-foreground">{"{"}</span>;
            const close = <span className="text-foreground">{"}"}</span>;

            if (keys.length === 0) return <>{open}{close}</>;

            if (isCollapsed(p)) {
                return (
                    <>
                        <button
                            type="button"
                            onClick={() => toggle(p)}
                            className="mr-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground hover:bg-accent hover:text-accent-foreground align-middle"
                            title="Expand object"
                        >
                            +
                        </button>
                        {open}
                        <span className="text-muted-foreground">… {keys.length} keys …</span>
                        {close}
                    </>
                );
            }

            return (
                <>
                    <button
                        type="button"
                        onClick={() => toggle(p)}
                        className="mr-1 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-foreground hover:bg-accent hover:text-accent-foreground align-middle"
                        title="Collapse object"
                    >
                        −
                    </button>
                    {open}
                    {"\n"}
                    {keys.map((k, idx) => {
                        const childPath = `${p}.${k}`;
                        return (
                            <React.Fragment key={childPath}>
                                {pad}
                                {"  "}
                                <span className="text-blue-600 dark:text-blue-400">{JSON.stringify(k)}</span>
                                <span className="text-foreground">: </span>
                                {renderNode(obj[k], childPath, indent + 2)}
                                {idx < keys.length - 1 ? <span className="text-foreground">,</span> : null}
                                {"\n"}
                            </React.Fragment>
                        );
                    })}
                    {pad}
                    {close}
                </>
            );
        }

        return <span className="text-foreground">{String(v)}</span>;
    };

    return (
        <code className="wrap-break-word whitespace-pre-wrap">
            {renderNode(value, path, 0)}
        </code>
    );
}

function CodeBlock({ code }: { code: string }) {
    const isJSON = (() => {
        try {
            JSON.parse(code);
            return true;
        } catch {
            return false;
        }
    })();

    const [collapsed, setCollapsed] = React.useState<boolean>(false);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        // Reset UI state when code changes
        setCollapsed(false);
        setCopied(false);
    }, [code]);

    const parsedJson = React.useMemo(() => {
        if (!isJSON) return null;
        try {
            return JSON.parse(code) as unknown;
        } catch {
            return null;
        }
    }, [code, isJSON]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
            // Fallback for older browsers / permission issues
            try {
                const textarea = document.createElement("textarea");
                textarea.value = code;
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                document.execCommand("copy");
                document.body.removeChild(textarea);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1200);
            } catch {
                // ignore
            }
        }
    };

    return (
        <div className="mt-2 overflow-hidden rounded-lg border border-border bg-muted max-w-full">
            <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
                <div className="text-[10px] font-medium text-muted-foreground">
                    {isJSON ? "JSON" : "Text"}
                </div>
                <div className="flex items-center gap-2">
                    {isJSON && (
                        <button
                            type="button"
                            onClick={() => setCollapsed((v) => !v)}
                            className="rounded border border-border bg-background px-2 py-1 text-[10px] text-foreground hover:bg-accent hover:text-accent-foreground"
                        >
                            {collapsed ? "Expand" : "Collapse"}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="rounded border border-border bg-background px-2 py-1 text-[10px] text-foreground hover:bg-accent hover:text-accent-foreground"
                    >
                        {copied ? "Copied" : "Copy"}
                    </button>
                </div>
            </div>

            {collapsed && isJSON ? (
                <div className="px-3 py-2 text-xs font-mono text-muted-foreground">
                    {"{…}"}
                </div>
            ) : (
                <pre className="overflow-auto p-3 text-xs text-foreground">
                    {isJSON && parsedJson !== null ? (
                        <JsonViewer value={parsedJson} />
                    ) : (
                        <code className="wrap-break-word whitespace-pre-wrap">
                            {isJSON ? highlightJSON(code) : <span className="text-foreground">{code}</span>}
                        </code>
                    )}
                </pre>
            )}
        </div>
    );
}

type ApiResponse = {
    status: number;
    statusText: string;
    headers: Record<string, string>;
    body: unknown;
    error?: string;
};

function SidebarContent({
    selected,
    setSelected,
    defaultBaseUrl,
    onRouteSelect,
}: {
    selected: ApiRoute | null;
    setSelected: (route: ApiRoute) => void;
    defaultBaseUrl: string;
    onRouteSelect?: () => void;
}) {
    const handleRouteClick = (route: ApiRoute) => {
        setSelected(route);
        onRouteSelect?.();
    };

    return (
        <>
            <div>
                <h1 className="text-xl font-semibold text-foreground">API Reference</h1>
                <p className="mt-1 text-xs text-muted-foreground">
                    Base URL: <span className="font-mono break-all">{defaultBaseUrl}</span>
                </p>
            </div>

            <div className="rounded-lg border border-border bg-muted p-3 text-xs text-foreground">
                <div className="font-medium">Authentication</div>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                    <li>
                        <b className="text-foreground">Bearer</b>: header{" "}
                        <span className="font-mono break-all">
                            Authorization: Bearer &lt;NEXT_PUBLIC_API_SECRET&gt;
                        </span>
                    </li>
                    <li>
                        <b className="text-foreground">Cookie</b>: cookie <span className="font-mono">session</span> untuk endpoint auth.
                    </li>
                </ul>
            </div>

            <div className="space-y-1 text-xs font-medium text-muted-foreground">
                <div>Endpoints</div>
                <div className="max-h-[60vh] space-y-1 overflow-auto rounded-md border border-border bg-card p-1">
                    {API_ROUTES.map((route) => (
                        <button
                            key={route.path}
                            type="button"
                            onClick={() => handleRouteClick(route)}
                            className={`flex w-full items-center justify-between gap-2 rounded px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent hover:text-accent-foreground ${selected?.path === route.path ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                                }`}
                        >
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="font-mono text-[11px] sm:text-xs break-all">{route.path}</span>
                                <span className="text-[10px] text-muted-foreground line-clamp-1">
                                    {route.description ?? route.notes ?? ""}
                                </span>
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <div className="flex flex-wrap gap-1">
                                    {route.methods.map((m) => (
                                        <span
                                            key={`${route.path}-${m}`}
                                            className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${m === "GET"
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : m === "POST"
                                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    : m === "PUT"
                                                        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                                                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                                }`}
                                        >
                                            {m}
                                        </span>
                                    ))}
                                </div>
                                {route.auth && (
                                    <span className="rounded border border-border bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">
                                        {route.auth}
                                    </span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
}

export default function DocsPage() {
    const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const [selected, setSelected] = React.useState<ApiRoute | null>(API_ROUTES[0] ?? null);
    const [baseUrl, setBaseUrl] = React.useState(defaultBaseUrl);
    const [apiSecret, setApiSecret] = React.useState("");
    const [selectedMethod, setSelectedMethod] = React.useState<ApiMethod>("GET");
    const [queryParams, setQueryParams] = React.useState<Array<{ key: string; value: string }>>([]);
    const [requestBody, setRequestBody] = React.useState("");
    const [customHeaders, setCustomHeaders] = React.useState<Array<{ key: string; value: string }>>([]);
    const [response, setResponse] = React.useState<ApiResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [sheetOpen, setSheetOpen] = React.useState(false);

    React.useEffect(() => {
        if (selected) {
            setSelectedMethod(selected.methods[0] ?? "GET");
            setQueryParams([]);
            setRequestBody("");
            setCustomHeaders([]);
            setResponse(null);
        }
    }, [selected]);

    const handleAddQueryParam = () => {
        setQueryParams([...queryParams, { key: "", value: "" }]);
    };

    const handleUpdateQueryParam = (index: number, field: "key" | "value", value: string) => {
        const updated = [...queryParams];
        updated[index][field] = value;
        setQueryParams(updated);
    };

    const handleRemoveQueryParam = (index: number) => {
        setQueryParams(queryParams.filter((_, i) => i !== index));
    };

    const handleAddHeader = () => {
        setCustomHeaders([...customHeaders, { key: "", value: "" }]);
    };

    const handleUpdateHeader = (index: number, field: "key" | "value", value: string) => {
        const updated = [...customHeaders];
        updated[index][field] = value;
        setCustomHeaders(updated);
    };

    const handleRemoveHeader = (index: number) => {
        setCustomHeaders(customHeaders.filter((_, i) => i !== index));
    };

    const buildUrl = () => {
        if (!selected) return "";
        let url = `${baseUrl}${selected.path}`;
        const validParams = queryParams.filter((p) => p.key.trim() !== "");
        if (validParams.length > 0) {
            const searchParams = new URLSearchParams();
            validParams.forEach((p) => {
                if (p.value.trim() !== "") {
                    searchParams.append(p.key.trim(), p.value.trim());
                }
            });
            url += `?${searchParams.toString()}`;
        }
        return url;
    };

    const handleSendRequest = async () => {
        if (!selected) return;

        setLoading(true);
        setResponse(null);

        try {
            const url = buildUrl();
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };

            // Add Bearer token if needed
            if (selected.auth === "Bearer" && apiSecret.trim()) {
                headers.Authorization = `Bearer ${apiSecret.trim()}`;
            }

            // Add custom headers
            customHeaders.forEach((h) => {
                if (h.key.trim() && h.value.trim()) {
                    headers[h.key.trim()] = h.value.trim();
                }
            });

            const options: RequestInit = {
                method: selectedMethod,
                headers,
            };

            // Add body for POST/PUT
            if ((selectedMethod === "POST" || selectedMethod === "PUT") && requestBody.trim()) {
                try {
                    JSON.parse(requestBody);
                    options.body = requestBody;
                } catch {
                    setResponse({
                        status: 0,
                        statusText: "Invalid JSON",
                        headers: {},
                        body: null,
                        error: "Request body must be valid JSON",
                    });
                    setLoading(false);
                    return;
                }
            }

            const res = await fetch(url, options);
            const responseHeaders: Record<string, string> = {};
            res.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            let body: unknown;
            const contentType = res.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                body = await res.json();
            } else {
                body = await res.text();
            }

            setResponse({
                status: res.status,
                statusText: res.statusText,
                headers: responseHeaders,
                body,
            });
        } catch (error) {
            setResponse({
                status: 0,
                statusText: "Error",
                headers: {},
                body: null,
                error: error instanceof Error ? error.message : "Unknown error",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-[1600px] container p-3 sm:p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-3 md:gap-6">
                {/* Mobile: Sheet Sidebar */}
                <div className="md:hidden">
                    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="sm" className="gap-2">
                                <Menu className="h-4 w-4" />
                                <span>Menu</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[85vw] sm:w-[400px] overflow-y-auto px-4">
                            <SheetTitle className="sr-only">API Reference Menu</SheetTitle>
                            <div className="space-y-4 mt-6">
                                <SidebarContent
                                    selected={selected}
                                    setSelected={setSelected}
                                    defaultBaseUrl={defaultBaseUrl}
                                    onRouteSelect={() => setSheetOpen(false)}
                                />
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop: Sticky Sidebar */}
                <aside className="hidden md:block w-full max-w-xs shrink-0 space-y-4 border-r border-border pr-4 overflow-y-auto sticky top-6 self-start max-h-[calc(100vh-3rem)]">
                    <SidebarContent
                        selected={selected}
                        setSelected={setSelected}
                        defaultBaseUrl={defaultBaseUrl}
                    />
                </aside>

                {/* Panel detail endpoint */}
                <section className="flex-1 min-w-0 overflow-y-auto space-y-3 md:space-y-4">
                    {selected ? (
                        <>
                            <header className="space-y-2 border-b pb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    {selected.methods.map((m) => (
                                        <Badge key={`${selected.path}-${m}`}>{m}</Badge>
                                    ))}
                                    <span className="font-mono text-xs sm:text-sm break-all">{selected.path}</span>
                                </div>
                                {selected.description && (
                                    <p className="text-xs sm:text-sm text-neutral-600">{selected.description}</p>
                                )}
                                {selected.auth && (
                                    <div className="text-xs text-neutral-600 break-all">
                                        Auth:{" "}
                                        <span className="font-mono">
                                            {selected.auth === "Bearer"
                                                ? "Authorization: Bearer <NEXT_PUBLIC_API_SECRET>"
                                                : selected.auth === "Cookie"
                                                    ? "Cookie: session=<value>"
                                                    : "None"}
                                        </span>
                                    </div>
                                )}
                                {selected.notes && (
                                    <p className="text-xs text-neutral-500">{selected.notes}</p>
                                )}
                            </header>

                            {/* Try it out section */}
                            <div className="space-y-3 md:space-y-4 rounded-lg border border-border bg-muted p-3 md:p-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <h3 className="text-sm font-semibold text-foreground">Try it out</h3>
                                    <button
                                        type="button"
                                        onClick={handleSendRequest}
                                        disabled={loading || !selected}
                                        className="w-full sm:w-auto rounded bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? "Sending..." : "Send Request"}
                                    </button>
                                </div>

                                {/* Base URL & API Secret */}
                                <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-foreground">
                                            Base URL
                                        </label>
                                        <Input
                                            type="text"
                                            value={baseUrl}
                                            onChange={(e) => setBaseUrl(e.target.value)}
                                            className="w-full px-2 py-1.5 text-xs font-mono"
                                            placeholder={defaultBaseUrl}
                                        />
                                    </div>
                                    {selected.auth === "Bearer" && (
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-foreground">
                                                API Secret (Bearer Token)
                                            </label>
                                            <Input
                                                type="password"
                                                value={apiSecret}
                                                onChange={(e) => setApiSecret(e.target.value)}
                                                className="w-full px-2 py-1.5 text-xs font-mono"
                                                placeholder="NEXT_PUBLIC_API_SECRET"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Method selector */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-foreground">
                                        Method
                                    </label>
                                    <Select
                                        value={selectedMethod}
                                        onValueChange={(value) => setSelectedMethod(value as ApiMethod)}
                                    >
                                        <SelectTrigger className="w-full text-xs">
                                            <SelectValue placeholder="Select method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {selected.methods.map((m) => (
                                                <SelectItem key={m} value={m}>
                                                    {m}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* URL Preview */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-foreground">
                                        Request URL
                                    </label>
                                    <div className="rounded border border-input bg-background px-2 py-1.5 text-xs font-mono text-muted-foreground wrap-break-word overflow-x-auto">
                                        {buildUrl()}
                                    </div>
                                </div>

                                {/* Query Parameters */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Query Parameters
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddQueryParam}
                                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {queryParams.map((param, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row gap-2">
                                                <Input
                                                    type="text"
                                                    value={param.key}
                                                    onChange={(e) =>
                                                        handleUpdateQueryParam(idx, "key", e.target.value)
                                                    }
                                                    placeholder="key"
                                                    className="flex-1 h-8 px-2 py-1 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    value={param.value}
                                                    onChange={(e) =>
                                                        handleUpdateQueryParam(idx, "value", e.target.value)
                                                    }
                                                    placeholder="value"
                                                    className="flex-1 h-8 px-2 py-1 text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveQueryParam(idx)}
                                                    className="rounded border border-neutral-300 dark:border-neutral-700 px-2 py-1 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 sm:w-auto w-full"
                                                >
                                                    × Remove
                                                </button>
                                            </div>
                                        ))}
                                        {queryParams.length === 0 && (
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">No query parameters</p>
                                        )}
                                    </div>
                                </div>

                                {/* Request Body (for POST/PUT) */}
                                {(selectedMethod === "POST" || selectedMethod === "PUT") && (
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                                            Request Body (JSON)
                                        </label>
                                        <Textarea
                                            value={requestBody}
                                            onChange={(e) => setRequestBody(e.target.value)}
                                            rows={6}
                                            className="w-full px-2 py-1.5 font-mono text-xs resize-y"
                                            placeholder='{"key": "value"}'
                                        />
                                    </div>
                                )}

                                {/* Custom Headers */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-medium text-foreground">
                                            Custom Headers
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleAddHeader}
                                            className="text-xs text-primary hover:text-primary/80"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        {customHeaders.map((header, idx) => (
                                            <div key={idx} className="flex flex-col sm:flex-row gap-2">
                                                <Input
                                                    type="text"
                                                    value={header.key}
                                                    onChange={(e) =>
                                                        handleUpdateHeader(idx, "key", e.target.value)
                                                    }
                                                    placeholder="Header name"
                                                    className="flex-1 h-8 px-2 py-1 text-xs"
                                                />
                                                <Input
                                                    type="text"
                                                    value={header.value}
                                                    onChange={(e) =>
                                                        handleUpdateHeader(idx, "value", e.target.value)
                                                    }
                                                    placeholder="Header value"
                                                    className="flex-1 h-8 px-2 py-1 text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveHeader(idx)}
                                                    className="rounded border border-input bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-accent-foreground sm:w-auto w-full"
                                                >
                                                    × Remove
                                                </button>
                                            </div>
                                        ))}
                                        {customHeaders.length === 0 && (
                                            <p className="text-xs text-muted-foreground">No custom headers</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Response Section */}
                            {response && (
                                <div className="space-y-2 rounded-lg border border-border bg-card p-3 md:p-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                        <span className="text-xs font-semibold text-foreground">Response</span>
                                        <span
                                            className={`rounded px-2 py-0.5 text-xs font-medium ${response.status >= 200 && response.status < 300
                                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                                : response.status >= 400
                                                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                                                    : "bg-muted text-muted-foreground"
                                                }`}
                                        >
                                            {response.status} {response.statusText}
                                        </span>
                                    </div>

                                    {response.error && (
                                        <div className="rounded bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
                                            Error: {response.error}
                                        </div>
                                    )}

                                    {Object.keys(response.headers).length > 0 && (
                                        <div>
                                            <div className="mb-1 text-xs font-medium text-foreground">
                                                Headers
                                            </div>
                                            <CodeBlock
                                                code={JSON.stringify(response.headers, null, 2)}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <div className="mb-1 text-xs font-medium text-foreground">Body</div>
                                        <CodeBlock
                                            code={
                                                typeof response.body === "string"
                                                    ? response.body
                                                    : JSON.stringify(response.body, null, 2)
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Documentation */}
                            <div className="rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
                                <div className="font-semibold text-foreground">Response Format</div>
                                <p className="mt-1">
                                    Semua endpoint API mengembalikan JSON dengan struktur umum:
                                    <span className="ml-1 font-mono text-foreground">
                                        {`{ "success": boolean, "message"?: string, "data"?: any }`}
                                    </span>
                                </p>
                                <p className="mt-1">
                                    Beberapa endpoint juga menambahkan field lain seperti{" "}
                                    <span className="font-mono text-foreground">pagination</span> atau{" "}
                                    <span className="font-mono text-foreground">meta</span> (misalnya untuk products dan
                                    popular products).
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                            Pilih endpoint dari sidebar untuk melihat detail.
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
