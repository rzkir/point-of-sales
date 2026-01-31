"use client";

import * as React from "react";

export function useJsonViewerState() {
    const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});

    const toggle = React.useCallback((p: string) => {
        setCollapsed((prev) => ({ ...prev, [p]: !prev[p] }));
    }, []);

    const isCollapsed = React.useCallback(
        (p: string) => Boolean(collapsed[p]),
        [collapsed]
    );

    return { collapsed, setCollapsed, toggle, isCollapsed };
}

export function useCodeBlockState(code: string) {
    const [collapsed, setCollapsed] = React.useState<boolean>(false);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        setCollapsed(false);
        setCopied(false);
    }, [code]);

    const handleCopy = React.useCallback(async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1200);
        } catch {
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
    }, [code]);

    return { collapsed, setCollapsed, copied, handleCopy };
}

export function useSidebarContentState() {
    const [searchQuery, setSearchQuery] = React.useState("");
    return { searchQuery, setSearchQuery };
}

// --- Helpers for docs page ---
function extractPathParams(path: string): string[] {
    const matches = path.match(/\[(\w+)\]/g);
    if (!matches) return [];
    return matches.map((m) => m.slice(1, -1));
}

function extractQueryParamsFromExample(route: ApiRoute): Array<{ key: string; value: string }> {
    if (!route.example?.curl) return [];
    try {
        const normalizedCurl = route.example.curl.replace(/\\\s*\n\s*/g, " ").trim();
        const urlMatch = normalizedCurl.match(/["']([^"']+?)["']/) || normalizedCurl.match(/["']([^"']+)["']/);
        if (!urlMatch) return [];
        let url = urlMatch[1];
        url = url.replace(/\{\{BASE_URL\}\}/g, "https://example.com");
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "https://" + url;
        }
        const urlObj = new URL(url);
        const params: Array<{ key: string; value: string }> = [];
        urlObj.searchParams.forEach((value, key) => {
            params.push({ key, value: decodeURIComponent(value) });
        });
        return params;
    } catch {
        return [];
    }
}

export function useDocsPageState(apiRoutes: ApiRoute[], defaultBaseUrl: string) {
    const [selected, setSelected] = React.useState<ApiRoute | null>(apiRoutes[0] ?? null);
    const [apiSecret, setApiSecret] = React.useState("");
    const [selectedMethod, setSelectedMethod] = React.useState<ApiMethod>("GET");
    const [queryParams, setQueryParams] = React.useState<Array<{ key: string; value: string }>>([]);
    const [requestBody, setRequestBody] = React.useState("");
    const [customHeaders, setCustomHeaders] = React.useState<Array<{ key: string; value: string }>>([]);
    const [pathParams, setPathParams] = React.useState<Record<string, string>>({});
    const [response, setResponse] = React.useState<ApiResponse | null>(null);
    const [loading, setLoading] = React.useState(false);
    const [sheetOpen, setSheetOpen] = React.useState(false);

    React.useEffect(() => {
        if (selected) {
            setSelectedMethod(selected.methods[0] ?? "GET");
            const exampleParams = extractQueryParamsFromExample(selected);
            setQueryParams(exampleParams.length > 0 ? exampleParams : []);
            setRequestBody("");
            setCustomHeaders([]);
            setResponse(null);
            const params = extractPathParams(selected.path);
            const initialParams: Record<string, string> = {};
            params.forEach((param) => {
                initialParams[param] = "";
            });
            setPathParams(initialParams);
        }
    }, [selected]);

    const handleAddQueryParam = React.useCallback(() => {
        setQueryParams((prev) => [...prev, { key: "", value: "" }]);
    }, []);

    const handleUpdateQueryParam = React.useCallback((index: number, field: "key" | "value", value: string) => {
        setQueryParams((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleRemoveQueryParam = React.useCallback((index: number) => {
        setQueryParams((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleAddHeader = React.useCallback(() => {
        setCustomHeaders((prev) => [...prev, { key: "", value: "" }]);
    }, []);

    const handleUpdateHeader = React.useCallback((index: number, field: "key" | "value", value: string) => {
        setCustomHeaders((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }, []);

    const handleRemoveHeader = React.useCallback((index: number) => {
        setCustomHeaders((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const buildUrl = React.useCallback(() => {
        if (!selected) return "";
        let url = `${defaultBaseUrl}${selected.path}`;
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
    }, [selected, defaultBaseUrl, pathParams, queryParams]);

    const handleSendRequest = React.useCallback(async () => {
        if (!selected) return;
        setLoading(true);
        setResponse(null);
        try {
            const url = buildUrl();
            const headers: Record<string, string> = {
                "Content-Type": "application/json",
            };
            if (selected.auth === "Bearer" && apiSecret.trim()) {
                headers.Authorization = `Bearer ${apiSecret.trim()}`;
            }
            customHeaders.forEach((h) => {
                if (h.key.trim() && h.value.trim()) {
                    headers[h.key.trim()] = h.value.trim();
                }
            });
            const options: RequestInit = {
                method: selectedMethod,
                headers,
            };
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
    }, [selected, apiSecret, customHeaders, selectedMethod, requestBody, buildUrl]);

    return {
        defaultBaseUrl,
        selected,
        setSelected,
        apiSecret,
        setApiSecret,
        selectedMethod,
        setSelectedMethod,
        queryParams,
        setQueryParams,
        requestBody,
        setRequestBody,
        customHeaders,
        setCustomHeaders,
        pathParams,
        setPathParams,
        response,
        setResponse,
        loading,
        sheetOpen,
        setSheetOpen,
        extractPathParams,
        handleAddQueryParam,
        handleUpdateQueryParam,
        handleRemoveQueryParam,
        handleAddHeader,
        handleUpdateHeader,
        handleRemoveHeader,
        buildUrl,
        handleSendRequest,
    };
}
