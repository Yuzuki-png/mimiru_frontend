import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config } from '../../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    const requestData = { email, password };

    const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'ログインに失敗しました' },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        accessToken: data.accessToken,
        user: data.user
      }
    });
    
  } catch {
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
} 