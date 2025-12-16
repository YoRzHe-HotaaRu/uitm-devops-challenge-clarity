import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        })

        const data = await response.json()
        return NextResponse.json(data, { status: response.status })
    } catch (error) {
        console.error('Forgot password API error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to connect to server' },
            { status: 500 }
        )
    }
}
