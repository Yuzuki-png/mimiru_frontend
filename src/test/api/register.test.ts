import { expect, test } from 'vitest';
import { testBaseUrl } from '../constants';
import { POST } from '../../app/api/auth/register/route';
import { NextRequest } from 'next/server';

test('POST /api/auth/registerでAPIコールが実行される', async () => {
  const request = new NextRequest(`${testBaseUrl}/auth/register`, {
    method: 'POST',
    body: JSON.stringify({
      email: 'newuser@example.com',
      password: 'password123',
      username: 'testuser'
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const response = await POST(request);
  
  expect(response.status).toBeGreaterThanOrEqual(200);
  
  const body = await response.json();
  expect(body).toHaveProperty('success');
});