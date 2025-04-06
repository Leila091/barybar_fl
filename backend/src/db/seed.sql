-- Вставка тестовых объявлений
INSERT INTO listings (
    title,
    description,
    price,
    category_id,
    user_id,
    photos,
    location,
    status,
    created_at
) VALUES 
    (
        'MacBook Pro 2021 в аренду',
        'Мощный ноутбук для работы и учебы. 16 GB RAM, 512 SSD',
        3000,
        1, -- Электроника
        1,
        ARRAY['macbook.jpg'],
        'Москва',
        'active',
        NOW() - INTERVAL '1 day'
    ),
    (
        'Профессиональная фотокамера Canon',
        'Canon EOS R5 с объективом 24-70mm f/2.8',
        2500,
        1, -- Электроника
        1,
        ARRAY['canon.jpg'],
        'Москва',
        'active',
        NOW() - INTERVAL '2 days'
    ),
    (
        'Горный велосипед Trek',
        'Отличный велосипед для активного отдыха',
        1000,
        7, -- Спорт и отдых
        1,
        ARRAY['bike.jpg'],
        'Москва',
        'active',
        NOW() - INTERVAL '3 days'
    ),
    (
        'Электрогитара Fender',
        'Fender Stratocaster, идеальное состояние',
        2000,
        10, -- Музыкальные инструменты
        1,
        ARRAY['guitar.jpg'],
        'Москва',
        'active',
        NOW()
    ),
    (
        'Игровая приставка PS5',
        'PlayStation 5 с двумя геймпадами',
        2500,
        1, -- Электроника
        1,
        ARRAY['ps5.jpg'],
        'Москва',
        'active',
        NOW() - INTERVAL '4 days'
    ),
    (
        'Электроинструменты набор',
        'Профессиональный набор инструментов Bosch',
        1500,
        8, -- Инструменты
        1,
        ARRAY['tools.jpg'],
        'Москва',
        'active',
        NOW() - INTERVAL '5 days'
    ); 