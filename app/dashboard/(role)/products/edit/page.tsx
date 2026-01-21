import EditProducts from '@/components/dashboard/products/edit/EditProducts'

type PageProps = {
    params: Record<string, string | string[] | undefined>
    searchParams: Record<string, string | string[] | undefined>
}

export default function page({ searchParams }: PageProps) {
    const idRaw = searchParams?.id
    const productId =
        typeof idRaw === "string" ? idRaw : Array.isArray(idRaw) ? idRaw[0] : undefined

    return (
        <EditProducts productId={productId} />
    )
}
