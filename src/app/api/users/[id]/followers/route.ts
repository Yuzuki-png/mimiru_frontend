import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.mimiru-api.com';
    const { searchParams } = new URL(request.url);
    
    // クエリパラメータを構築
    const queryString = searchParams.toString();
    const urlWithParams = `${backendUrl}/users/${params.id}/followers${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(urlWithParams, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch followers data' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch  {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}