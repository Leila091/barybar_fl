import { Metadata } from 'next';
import { getListingsByCategory } from '@/app/api/listings/category/[id]/route';

interface CategoryPageProps {
    params: {
        id: string;
    };
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
    const response = await getListingsByCategory(params.id);
    if (!response) {
        return {
            title: 'Категория не найдена',
        };
    }
    return {
        title: response.categoryName,
    };
} 