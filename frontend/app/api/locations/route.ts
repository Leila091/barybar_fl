import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://localhost:3001/api/location', {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch locations');
        }

        const locations = await response.json();
        return NextResponse.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json(
            { error: 'Failed to fetch locations' },
            { status: 500 }
        );
    }
} 