export const formatCurrency = (value?: number) => {
    const n = Number(value ?? 0)
    if (Number.isNaN(n)) return "-"
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(n)
}

export const formatNumber = (value: string | number | undefined): string => {
    if (!value && value !== 0) return ""
    const num = typeof value === "string" ? parseFloat(value.replace(/\./g, "")) : value
    if (isNaN(num)) return ""
    return num.toLocaleString("id-ID")
}

export const parseNumber = (value: string): string => {
    if (!value) return ""
    return value.replace(/\./g, "").replace(/,/g, ".")
}

export const toDateInputValue = (value: unknown): string => {
    if (!value) return ""
    const s = String(value).trim()
    if (!s) return ""
    // ISO -> YYYY-MM-DD
    if (s.includes("T")) return s.split("T")[0] ?? ""
    // already YYYY-MM-DD...
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10)
    return ""
}