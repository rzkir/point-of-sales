import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

export async function GET(request: NextRequest) {
    try {
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!APPS_SCRIPT_URL) {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify({ action: 'list', sheet: process.env.NEXT_PUBLIC_SUPPLIERS as string }),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Apps Script returned non-JSON response:', textResponse.substring(0, 500));
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid response from Apps Script. Please check your Apps Script deployment and URL.'
                },
                { status: 500 }
            );
        }

        const data = await response.json();

        if (!data.success) {
            console.error('Failed to get suppliers:', data.message);
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        });
    } catch (error) {
        console.error('Get suppliers error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        if (!API_SECRET || request.headers.get("authorization") !== `Bearer ${API_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, contact_person, phone, email, address, is_active } = body;

        if (!name || String(name).trim() === '') {
            return NextResponse.json(
                { success: false, message: 'Supplier name is required' },
                { status: 400 }
            );
        }

        if (!APPS_SCRIPT_URL) {
            return NextResponse.json(
                { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
                { status: 500 }
            );
        }

        const requestBody = {
            action: 'create',
            sheet: process.env.NEXT_PUBLIC_SUPPLIERS as string,
            name: String(name).trim(),
            contact_person: contact_person ? String(contact_person).trim() : '',
            phone: phone ? String(phone).trim() : '',
            email: email ? String(email).trim() : '',
            address: address ? String(address).trim() : '',
            is_active: is_active !== undefined ? is_active : true,
        };

        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_SECRET}`,
            },
            body: JSON.stringify(requestBody),
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.error('Apps Script returned non-JSON response:', textResponse.substring(0, 500));
            return NextResponse.json(
                {
                    success: false,
                    message: 'Invalid response from Apps Script. Please check your Apps Script deployment and URL.'
                },
                { status: 500 }
            );
        }

        const data = await response.json();

        if (!data.success) {
            console.error('Create supplier failed from Apps Script:', data.message);
            return NextResponse.json(
                { success: false, message: data.message },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: data.message,
            data: data.data,
        });
    } catch (error) {
        console.error('Create supplier error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Internal server error'
            },
            { status: 500 }
        );
    }
}