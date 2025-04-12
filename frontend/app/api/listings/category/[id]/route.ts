// frontend/app/api/listings/category/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const locationId = searchParams.get('locationId');

        // Формируем URL для бэкенда с параметрами фильтрации
        const backendUrl = new URL(`http://localhost:3001/listings/category/${params.id}`);

        // Добавляем параметр status=published
        backendUrl.searchParams.set('status', 'published');

        // Добавляем параметры фильтрации только если они заданы и валидны
        if (minPrice && !isNaN(Number(minPrice))) {
            backendUrl.searchParams.set('minPrice', minPrice);
        }
        if (maxPrice && !isNaN(Number(maxPrice))) {
            backendUrl.searchParams.set('maxPrice', maxPrice);
        }
        if (locationId && !isNaN(Number(locationId))) {
            backendUrl.searchParams.set('locationId', locationId);
        }

        console.log('Fetching from backend URL:', backendUrl.toString());

        const response = await fetch(backendUrl.toString(), {
            cache: 'no-store', // Отключаем кэширование
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        });

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'Category not found' },
                    { status: 404 }
                );
            }
            throw new Error('Failed to fetch listings');
        }

        const data = await response.json();

        // Добавляем заголовки для предотвращения кэширования
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch listings' },
            { status: 500 }
        );
    }
}