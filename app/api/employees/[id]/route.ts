import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

const API_SECRET = process.env.NEXT_PUBLIC_API_SECRET;

// Helper: Check authorization
import { checkAuth, validateAppsScriptUrl, validateId } from "@/lib/validation"

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
      { status: data.message.includes('not found') ? 404 : 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: data.message,
    data: data.data,
  });
}

/**
 * GET /api/employees/[id] - Get employee by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = checkAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const idError = validateId(id);
    if (idError) return idError;

    const urlError = validateAppsScriptUrl();
    if (urlError) return urlError;

    const requestBody = { action: 'get', sheet: 'Users', id };
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
 * PUT /api/employees/[id] - Update employee
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = checkAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const idError = validateId(id);
    if (idError) return idError;

    const body = await request.json();
    const { name, email, roleType, branchName } = body;

    const urlError = validateAppsScriptUrl();
    if (urlError) return urlError;

    const requestBody: {
      action: string;
      sheet: string;
      id: string;
      name?: string;
      email?: string;
      roleType?: string;
      branchName?: string;
    } = {
      action: 'update',
      sheet: 'Users',
      id,
    };

    if (name !== undefined && name !== null) {
      requestBody.name = String(name).trim();
    }
    if (email !== undefined && email !== null) {
      requestBody.email = String(email).trim();
    }
    if (roleType !== undefined && roleType !== null) {
      requestBody.roleType = String(roleType).trim();
    }
    if (branchName !== undefined) {
      requestBody.branchName = branchName ? String(branchName).trim() : '';
    }

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
 * DELETE /api/employees/[id] - Delete employee
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authError = checkAuth(request);
    if (authError) return authError;

    const { id } = await params;
    const idError = validateId(id);
    if (idError) return idError;

    const urlError = validateAppsScriptUrl();
    if (urlError) return urlError;

    const requestBody = {
      action: 'delete',
      sheet: 'Users',
      id,
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
