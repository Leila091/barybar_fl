import Image from 'next/image';
import Link from 'next/link';

interface Listing {
    id: number;
    title: string;
    description: string;
    price: number;
    photos: string[];
}

interface ListingCardProps {
    listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
    return (
        <Link href={`/listings/${listing.id}`} className="block">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                    {listing.photos && listing.photos.length > 0 ? (
                        <Image
                            src={listing.photos[0]}
                            alt={listing.title}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">Нет фото</span>
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                    <p className="text-gray-600 mb-2 line-clamp-2">{listing.description}</p>
                    <p className="text-lg font-bold text-orange-500">{listing.price} ₸</p>
                </div>
            </div>
        </Link>
    );
} 