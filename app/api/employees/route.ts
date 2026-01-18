import { NextRequest, NextResponse } from 'next/server';

// Ganti dengan Web App URL dari Google Apps Script
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

/**
 * GET /api/employees - Get all employees (Users from Users sheet)
 */
export async function GET(request: NextRequest) {
  try {
    // Validasi APPS_SCRIPT_URL
    if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      return NextResponse.json(
        { success: false, message: 'Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local' },
        { status: 500 }
      );
    }

    // Panggil Google Apps Script untuk list users dari sheet Users
    // Menggunakan action 'list' dengan parameter sheet untuk membedakan dari branches
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'list', sheet: 'Users' }),
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

    if (!data.success) {
      console.error('Failed to get employees:', data.message);
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
    console.error('Get employees error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/employees - Create a new employee (User)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, roleType } = body;

    // Debug logging
    console.log('Create employee request received:', { name, email, roleType });

    // Validasi
    if (!name || String(name).trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Employee name is required' },
        { status: 400 }
      );
    }

    if (!email || String(email).trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
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
    // Menggunakan action 'create' dengan parameter sheet untuk membedakan dari branches
    const requestBody = {
      action: 'create',
      sheet: 'Users',
      name: String(name).trim(),
      email: String(email).trim(),
      password: password ? String(password).trim() : '',
      roleType: roleType ? String(roleType).trim() : 'karyawan',
    };

    console.log('Sending to Apps Script:', { ...requestBody, password: password ? '***' : '' });

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
      console.error('Create employee failed from Apps Script:', data.message);
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
    console.error('Create employee error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
