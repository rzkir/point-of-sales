/**
 * Utility untuk formatting tanggal secara konsisten di seluruh aplikasi.
 *
 * Contoh:
 * - formatDate("2025-01-23") => "23/01/2025"
 * - formatDate(new Date(), "id-ID", { dateStyle: "medium" })
 */
export function formatDate(
    value?: string | number | Date | null,
    locale: string = "id-ID",
    options?: Intl.DateTimeFormatOptions
): string {
    if (value === null || value === undefined || value === "") {
        return "-"
    }

    const date = value instanceof Date ? value : new Date(value)

    if (isNaN(date.getTime())) {
        return "-"
    }

    // Jika user mengirim options sendiri, hormati apa adanya
    if (options) {
        return new Intl.DateTimeFormat(locale, options).format(date)
    }

    // Default: "23 - januari - 2023"
    const formatter = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })

    const parts = formatter.formatToParts(date)
    const day = parts.find((p) => p.type === "day")?.value ?? ""
    const rawMonth = parts.find((p) => p.type === "month")?.value ?? ""
    const month = rawMonth
        ? rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1).toLowerCase()
        : ""
    const year = parts.find((p) => p.type === "year")?.value ?? ""

    if (!day || !month || !year) {
        return formatter.format(date)
    }

    return `${day} - ${month} - ${year}`
}

/**
 * Utility untuk formatting tanggal + jam secara konsisten.
 *
 * Contoh:
 * - formatDateTime("2025-01-23T14:30:00Z") => "23/01/2025 21.30" (tergantung zona waktu)
 */
export function formatDateTime(
    value?: string | number | Date | null,
    locale: string = "id-ID",
    options?: Intl.DateTimeFormatOptions
): string {
    if (value === null || value === undefined || value === "") {
        return "-"
    }

    const date = value instanceof Date ? value : new Date(value)

    if (isNaN(date.getTime())) {
        return "-"
    }

    // Jika user mengirim options sendiri, hormati apa adanya
    if (options) {
        return new Intl.DateTimeFormat(locale, options).format(date)
    }

    // Default: "23 - januari - 2023 14.30" (format lokal id-ID untuk jam)
    const formatter = new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })

    const parts = formatter.formatToParts(date)
    const day = parts.find((p) => p.type === "day")?.value ?? ""
    const rawMonth = parts.find((p) => p.type === "month")?.value ?? ""
    const month = rawMonth
        ? rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1).toLowerCase()
        : ""
    const year = parts.find((p) => p.type === "year")?.value ?? ""
    const hour = parts.find((p) => p.type === "hour")?.value ?? ""
    const minute = parts.find((p) => p.type === "minute")?.value ?? ""

    if (!day || !month || !year || !hour || !minute) {
        return formatter.format(date)
    }

    // Gunakan pemisah jam-menit sesuai locale bawaan Intl
    const timeFormatter = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    })
    const time = timeFormatter.format(date)

    return `${day} - ${month} - ${year} ${time}`
}
