import { NextRequest, NextResponse } from 'next/server';

import { jsonError } from '@/lib/validation';

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    if ((!email && !name) || !password) {
      return jsonError('Email or name and password are required', 400);
    }

    if (!APPS_SCRIPT_URL) {
      return jsonError('Apps Script URL is not configured. Please set APPS_SCRIPT_URL in .env.local', 500);
    }

    const requestBody =
      email
        ? { action: 'login', password, email }
        : { action: 'login', password, email: name as string, name: name as string };

    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const textResponse = await response.text();
      console.error('Apps Script returned non-JSON response:', textResponse.substring(0, 500));
      return jsonError(
        'Invalid response from Apps Script. Please check your Apps Script deployment and URL.',
        500
      );
    }

    const data = await response.json();

    if (!data.success) {
      console.error('Login failed from Apps Script:', data.message);
      return jsonError(data.message, 401);
    }

    const res = NextResponse.json({
      success: true,
      message: data.message,
      data: data.data,
    });

    res.cookies.set('session', JSON.stringify(data.data), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return res;
  } catch (error) {
    console.error('Login error:', error);
    return jsonError(error instanceof Error ? error.message : 'Internal server error', 500);
  }
}
