import * as React from "react";

import apiRoutesData from "@/app/dashboard/data.json";

export function Badge({ children }: { children: React.ReactNode }) {
    return (
        <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
            {children}
        </span>
    );
}

export function highlightJSON(code: string): React.ReactNode {
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

export function JsonViewer({
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

export function CodeBlock({ code }: { code: string }) {
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

export function SidebarContent({
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
    const API_ROUTES: ApiRoute[] = apiRoutesData as ApiRoute[];

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