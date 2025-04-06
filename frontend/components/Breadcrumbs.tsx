'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaChevronRight } from 'react-icons/fa';

interface BreadcrumbItem {
    label: string;
    href: string;
}

const Breadcrumbs = () => {
    const pathname = usePathname();
    const paths = pathname.split('/').filter(Boolean);

    const breadcrumbs: BreadcrumbItem[] = paths.map((path, index) => {
        const href = `/${paths.slice(0, index + 1).join('/')}`;
        let label = path;

        // Преобразуем ID в читаемый текст
        if (path.match(/^\d+$/)) {
            if (paths[index - 1] === 'categories') {
                label = 'Категория';
            } else if (paths[index - 1] === 'listing') {
                label = 'Объявление';
            }
        }

        // Преобразуем пути в читаемые названия
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

        label = pathLabels[path] || label;

        return { label, href };
    });

    return (
        <nav className="flex items-center text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-gray-700">
                Главная
            </Link>
            {breadcrumbs.map((item, index) => (
                <div key={item.href} className="flex items-center">
                    <FaChevronRight className="mx-2 text-gray-400" />
                    {index === breadcrumbs.length - 1 ? (
                        <span className="text-gray-900">{item.label}</span>
                    ) : (
                        <Link href={item.href} className="hover:text-gray-700">
                            {item.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
};

export default Breadcrumbs; 