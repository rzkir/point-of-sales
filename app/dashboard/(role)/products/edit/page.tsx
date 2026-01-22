import EditProducts from '@/components/dashboard/products/edit/EditProducts'

type PageProps = {
    params: Promise<Record<string, string | string[] | undefined>>
    searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function page({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams
    const idRaw = resolvedSearchParams?.id
    const productId =
        typeof idRaw === "string" ? idRaw : Array.isArray(idRaw) ? idRaw[0] : undefined

    return (
        <EditProducts productId={productId} />
    )
}
