export interface Review {
    id: number;
    userId: number;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Booking {
    id: number;
    listingId: number;
    userId: number;
    startDate: string;
    endDate: string;
    status: 'active' | 'completed' | 'cancelled' | 'confirmed' | 'pending';
    comment?: string;
    createdAt: string;
    title?: string;
    location?: string;
    price?: string;
    mainPhoto?: string;
    hasReview: boolean;
    review?: {
        id: number;
        rating: number;
        comment: string;
        createdAt: string;
    };
    fullName?: string;
    phone?: string;
    email?: string;
}

export interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    priceType: 'per_day' | 'per_item' | 'per_quantity';
    categoryId: number;
    location: string;
    startDate: string;
    endDate: string;
    photos: string[];
    userId: number;
    status: 'draft' | 'active' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    createdAt: string;
    updatedAt: string;
}

export interface Notification {
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
} 