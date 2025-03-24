//
// module.exports = {
//     async rewrites() {
//         return [
//             {
//                 source: '/api/:path*',
//                 destination: 'http://localhost:3000/api/:path*', // проксирование на сервер
//             },
//         ];
//     },
// };

module.exports = {
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:3001/api/:path*', // Теперь правильно проксируем на бэкенд
            },
        ];
    },
};

