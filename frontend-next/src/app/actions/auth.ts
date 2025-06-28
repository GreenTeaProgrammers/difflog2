'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'

// This function is not a Server Action, so it can be called from anywhere.
export async function verifyCredentials(identifier: unknown, password: unknown) {
  if (typeof identifier !== 'string' || typeof password !== 'string') {
    throw new Error('Invalid credentials');
  }

  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  // Assuming the API returns user data along with the token
  return { id: data.id, username: data.username, email: data.email, token: data.token };
}
