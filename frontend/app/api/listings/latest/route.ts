import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('Fetching latest listings from backend');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const response = await fetch(`${apiUrl}/listings/latest`, {
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store' // Отключаем кэширование
        });

        if (!response.ok) {
            console.error('Error response from backend:', response.status, response.statusText);
            throw new Error(`Failed to fetch latest listings: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully fetched listings:', data.length);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching latest listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch latest listings' },
            { status: 500 }
        );
    }
} 