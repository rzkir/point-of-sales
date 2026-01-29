import { NextRequest, NextResponse } from 'next/server';

import { checkAuth, validateAppsScriptUrl, callAppsScript } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const authError = checkAuth(request);
    if (authError) {
      return authError;
    }

    const body = await request.json();
    const { email, name, password, confirmPassword, roleType, branchId } = body;

    if (!email || !name || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const urlError = validateAppsScriptUrl();
    if (urlError) {
      return urlError;
    }

    const appsScriptResponse = await callAppsScript({
      action: 'register',
      email,
      name,
      password,
      roleType: roleType || 'karyawan',
      branchId: branchId || '',
    });

    return appsScriptResponse;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
