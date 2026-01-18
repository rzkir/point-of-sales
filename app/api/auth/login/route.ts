import { NextRequest, NextResponse } from 'next/server';

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Debug logging
    console.log('Login request received:', { email, name, password: password ? '***' : undefined });

    // Validasi
    if ((!email && !name) || !password) {
      return NextResponse.json(
        { success: false, message: 'Email or name and password are required' },
        { status: 400 }
      );
    }

    // Validasi APPS_SCRIPT_URL
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      return NextResponse.json(
        { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
        { status: 500 }
      );
    }

    // Prepare request body for Apps Script
    // Kompatibilitas dengan Apps Script versi lama dan baru:
    // - Versi lama: hanya cek !email, jadi perlu kirim email field
    // - Versi baru: cek email ATAU name, dan jika email tidak ada @ akan pakai findUserByName
    // Solusi: jika login dengan name, kirim email: name (tanpa @) agar versi lama lolos validasi
    // dan versi baru akan otomatis pakai findUserByName karena email tidak ada @
    const requestBody: {
      action: string;
      password: string;
      email?: string;
      name?: string;
    } = {
      action: 'login',
      password,
    };

    if (email) {
      // Login dengan email
      requestBody.email = email;
    } else if (name) {
      // Login dengan name: kirim name ke field email juga untuk kompatibilitas versi lama
      // Versi baru akan pakai findUserByName karena email tidak mengandung @
      requestBody.email = name;
      requestBody.name = name;
    }

    console.log('Sending to Apps Script:', { ...requestBody, password: '***' });

    // Panggil Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    // Cek content type
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

    console.log('Apps Script response:', {
      success: data.success,
      message: data.message,
      hasData: !!data.data
    });

    if (!data.success) {
      console.error('Login failed from Apps Script:', data.message);
      return NextResponse.json(
        { success: false, message: data.message },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      message: data.message,
      data: data.data,
    });

    // httpOnly session cookie untuk GET /api/auth/session
    res.cookies.set('session', JSON.stringify(data.data), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
