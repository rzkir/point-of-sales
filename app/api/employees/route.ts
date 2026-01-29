import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

import { checkAuth, validateAppsScriptUrl } from "@/lib/validation"

// Helper: Call Apps Script API and handle response
async function callAppsScript(requestBody: Record<string, unknown>) {
  const response = await fetch(APPS_SCRIPT_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_SECRET}`,
    },
    body: JSON.stringify(requestBody),
  });

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    await response.text();
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
}

/**
 * GET /api/employees - Get all employees (Users from Users sheet)
 */
export async function GET(request: NextRequest) {
  try {
    const authError = checkAuth(request);
    if (authError) return authError;

    const urlError = validateAppsScriptUrl();
    if (urlError) return urlError;

    const requestBody = { action: 'list', sheet: 'Users' };

    return await callAppsScript(requestBody);
  } catch (error) {
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
    const authError = checkAuth(request);
    if (authError) return authError;

    const body = await request.json();
    const { name, email, password, roleType, branchName } = body;

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

    const urlError = validateAppsScriptUrl();
    if (urlError) return urlError;

    const requestBody = {
      action: 'create',
      sheet: 'Users',
      name: String(name).trim(),
      email: String(email).trim(),
      password: password ? String(password).trim() : '',
      roleType: roleType ? String(roleType).trim() : 'karyawan',
      branchName: branchName ? String(branchName).trim() : '',
    };

    return await callAppsScript(requestBody);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
