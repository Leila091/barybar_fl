'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
    label: string;
    href: string;
}

const Breadcrumbs = () => {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);
    const [categoryName, setCategoryName] = useState<string | null>(null);

    useEffect(() => {
        const fetchCategoryName = async () => {
            const categoryIndex = paths.findIndex((p) => p === 'categories');
            const categoryId = paths[categoryIndex + 1];

            if (categoryId && /^\d+$/.test(categoryId)) {
                try {
                    const res = await fetch(`http://localhost:3001/api/category/${categoryId}`);
                    if (res.ok) {
                        const data = await res.json();
                        setCategoryName(data.name);
                    }
                } catch (error) {
                    console.error('Ошибка загрузки названия категории:', error);
                }
            }
        };

        fetchCategoryName();
    }, [pathname]);

    const breadcrumbs: BreadcrumbItem[] = paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        let label = path;

        // Обработка читаемых путей
        const pathLabels: Record<string, string> = {
            'categories': 'Категории',
            'listing': 'Объявления',
            'profile': 'Профиль',
            'create': 'Создать',
            'edit': 'Редактировать',
            'favorites': 'Избранное',
            'messages': 'Сообщения',
            'settings': 'Настройки'
        };

        // Заменим ID категории на название
        if (path.match(/^\d+$/) && paths[index - 1] === 'categories' && categoryName) {
            label = categoryName;
        } else {
            label = pathLabels[path] || label;
        }

        return { label, href };
    });

    return (
        <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">Главная</Link>
            {breadcrumbs.map((item, index) => (
                <div key={item.href} className="flex items-center">
                    <FaChevronRight className="mx-2 text-gray-400" />
                    {index === breadcrumbs.length - 1 ? (
                        <span className="text-gray-900">{item.label}</span>
                    ) : (
                        <Link href={item.href} className="hover:text-gray-700">{item.label}</Link>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
