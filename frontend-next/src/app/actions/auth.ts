'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email')
  const password = formData.get('password')

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { message: data.message || 'Login failed' }
    }

    (await cookies()).set('token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    (await cookies()).set('username', data.username, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
    })


  } catch (error) {
    console.error(error)
    return { message: 'An unexpected error occurred.' }
  }
  redirect('/welcome')
}

export async function register(prevState: any, formData: FormData) {
    const username = formData.get('username')
    const email = formData.get('email')
    const password = formData.get('password')

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            return { message: data.message || 'Registration failed' }
        }

    } catch (error) {
        console.error(error)
        return { message: 'An unexpected error occurred.' }
    }
    redirect('/login')
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('token')
    cookieStore.delete('username')
    redirect('/login')
}
