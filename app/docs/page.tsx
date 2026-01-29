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

import { Badge, CodeBlock, SidebarContent } from "@/components/docs";

import apiRoutesData from "@/app/dashboard/data.json";

const API_ROUTES: ApiRoute[] = apiRoutesData as ApiRoute[];

export default function DocsPage() {
    const defaultBaseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "";
    const [selected, setSelected] = React.useState<ApiRoute | null>(API_ROUTES[0] ?? null);
    const [apiSecret, setApiSecret] = React.useState("");
    const [selectedMethod, setSelectedMethod] = React.useState<ApiMethod>("GET");
    const [queryParams, setQueryParams] = React.useState<Array<{ key: string; value: string }>>([]);
    const [requestBody, setRequestBody] = React.useState("");
    const [customHeaders, setCustomHeaders] = React.useState<Array<{ key: string; value: string }>>([]);
    const [pathParams, setPathParams] = React.useState<Record<string, string>>({});
    const [response, setResponse] = React.useState<ApiResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [sheetOpen, setSheetOpen] = React.useState(false);

    // Extract dynamic path parameters (e.g., [id], [name])
    const extractPathParams = (path: string): string[] => {
        const matches = path.match(/\[(\w+)\]/g);
        if (!matches) return [];
        return matches.map((m) => m.slice(1, -1)); // Remove brackets
    };

    // Extract query parameters from example curl command
    const extractQueryParamsFromExample = (route: ApiRoute): Array<{ key: string; value: string }> => {
        if (!route.example?.curl) return [];

        try {
            // Remove backslash continuation and normalize whitespace
            const normalizedCurl = route.example.curl.replace(/\\\s*\n\s*/g, " ").trim();
            
            // Extract URL from curl command (between quotes)
            // Try double quotes first, then single quotes
            const urlMatch = normalizedCurl.match(/["']([^"']+?)["']/) || normalizedCurl.match(/["']([^"']+)["']/);
            if (!urlMatch) return [];

            let url = urlMatch[1];

            // Replace {{BASE_URL}} placeholder with dummy domain
            url = url.replace(/\{\{BASE_URL\}\}/g, "https://example.com");

            // Add protocol if missing (required for URL constructor)
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            const urlObj = new URL(url);
            const params: Array<{ key: string; value: string }> = [];

            urlObj.searchParams.forEach((value, key) => {
                // Decode URL-encoded values (e.g., Langgeng%20Jaya%201 -> Langgeng Jaya 1)
                params.push({ key, value: decodeURIComponent(value) });
            });

            return params;
        } catch {
            return [];
        }
    };

    React.useEffect(() => {
        if (selected) {
            setSelectedMethod(selected.methods[0] ?? "GET");

            // Extract query parameters from example if available
            const exampleParams = extractQueryParamsFromExample(selected);
            setQueryParams(exampleParams.length > 0 ? exampleParams : []);

            setRequestBody("");
            setCustomHeaders([]);
            setResponse(null);

            // Initialize path parameters
            const params = extractPathParams(selected.path);
            const initialParams: Record<string, string> = {};
            params.forEach((param) => {
                initialParams[param] = "";
            });
            setPathParams(initialParams);
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
        let url = `${defaultBaseUrl}${selected.path}`;

        // Replace path parameters (e.g., [id] -> actual value)
        const pathParamsList = extractPathParams(selected.path);
        pathParamsList.forEach((param) => {
            const value = pathParams[param] || "";
            url = url.replace(`[${param}]`, encodeURIComponent(value));
        });

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
                                            value={defaultBaseUrl}
                                            readOnly
                                            className="w-full px-2 py-1.5 text-xs font-mono bg-muted cursor-not-allowed"
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

                                {/* Path Parameters */}
                                {selected && extractPathParams(selected.path).length > 0 && (
                                    <div>
                                        <label className="mb-2 block text-xs font-medium text-foreground">
                                            Path Parameters
                                        </label>
                                        <div className="space-y-2">
                                            {extractPathParams(selected.path).map((param) => (
                                                <div key={param}>
                                                    <label className="mb-1 block text-xs text-muted-foreground">
                                                        {param}
                                                    </label>
                                                    <Input
                                                        type="text"
                                                        value={pathParams[param] || ""}
                                                        onChange={(e) =>
                                                            setPathParams({
                                                                ...pathParams,
                                                                [param]: e.target.value,
                                                            })
                                                        }
                                                        placeholder={`Enter ${param}`}
                                                        className="w-full px-2 py-1.5 text-xs font-mono"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

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
