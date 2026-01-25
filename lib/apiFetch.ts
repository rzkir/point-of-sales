const API_SECRET = `${process.env.NEXT_PUBLIC_API_SECRET}`;

interface ApiFetchOptions {
    revalidate?: number;
    tags?: string[];
}

export async function apiFetch<T>(
    url: string,
    options: ApiFetchOptions = {}
): Promise<T> {
    try {
        const headers: HeadersInit = {
            "Content-Type": "application/json",
        };

        // Always add Authorization header with API_SECRET
        if (API_SECRET) {
            headers.Authorization = `Bearer ${API_SECRET}`;
        }

        const fetchOptions: RequestInit = {
            headers,
            next: {
                revalidate: options.revalidate,
                tags: options.tags,
            },
        };

        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            const error: Error & { status?: number } = new Error(`Failed to fetch: ${response.statusText}`);
            error.status = response.status;
            throw error;
        }

        return response.json();
    } catch (error) {
        throw error;
    }
}