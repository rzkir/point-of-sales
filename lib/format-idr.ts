export const formatCurrency = (value?: number) => {
    const n = Number(value ?? 0)
    if (Number.isNaN(n)) return "-"
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(n)
}