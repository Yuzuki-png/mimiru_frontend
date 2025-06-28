import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { config } from '../../../../lib/config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username } = body;
    
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'メールアドレスとパスワードは必須です' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      );
    }

    const requestData = { email, password, username };

    const response = await fetch(`${config.apiBaseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || '登録に失敗しました' },
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