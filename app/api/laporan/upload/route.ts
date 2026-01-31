import { NextRequest, NextResponse } from "next/server";

import imagekit from "@/lib/imagekit";

export async function POST(request: NextRequest) {
    // Auth guard: require logged-in user via cookie session (or user.role fallback)
    const session = request.cookies.get("session")?.value
    const role = request.cookies.get("user.role")?.value
    if (!session && !role) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to ImageKit for receipt_url (laporan)
        const uploadResponse = await imagekit.upload({
            file: buffer,
            fileName: file.name,
            folder: "/laporan",
        });

        return NextResponse.json({
            url: uploadResponse.url,
            fileId: uploadResponse.fileId,
        });
    } catch (error) {
        console.error("Error uploading receipt image:", error);
        return NextResponse.json(
            { error: "Failed to upload receipt image" },
            { status: 500 }
        );
    }
}