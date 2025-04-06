import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const categoryId = searchParams.get('categoryId');
        const location = searchParams.get('location');

        // Формируем URL для бэкенда с параметрами фильтрации
        const backendUrl = new URL('http://localhost:3001/api/listings');
        if (minPrice) backendUrl.searchParams.append('minPrice', minPrice);
        if (maxPrice) backendUrl.searchParams.append('maxPrice', maxPrice);
        if (categoryId) backendUrl.searchParams.append('categoryId', categoryId);
        if (location) backendUrl.searchParams.append('location', location);

        const response = await fetch(backendUrl.toString());
        
        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        );
    }
} 