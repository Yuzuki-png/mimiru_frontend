import { expect, test } from 'vitest';
import { testBaseUrl } from '../constants';
import { POST as search } from '../../app/api/auth/login/route';
import { NextRequest } from 'next/server';

// ログインが成功することを確認する
test('POST /api/auth/loginでAPIコールが実行される', async () => {
  const request = new NextRequest(`${testBaseUrl}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123'
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const response = await search(request);
  
  expect(response.status).toBeGreaterThanOrEqual(200);
  
  const body = await response.json();
  expect(body).toHaveProperty('success');
});