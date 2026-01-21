const API_SECRET = process.env.API_SECRET as string;

export function checkAuthorization(request: Request): boolean {
    const authHeader = request.headers.get("authorization");

    return authHeader === `Bearer ${API_SECRET}`;
}