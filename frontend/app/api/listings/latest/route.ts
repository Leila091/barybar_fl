import { NextResponse } from 'next/server';

export async function GET() {
    try {
        console.log('Fetching latest listings from backend');
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const endpoint = `${apiUrl}/listings/latest`;
        console.log('Making request to:', endpoint);

        const response = await fetch(endpoint, {
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store'
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Successfully fetched listings:', data.length);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Full error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch latest listings', details: error.message },
            { status: 500 }
        );
    }
}