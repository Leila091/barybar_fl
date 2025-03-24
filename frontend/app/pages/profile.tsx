"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FaUser, FaEnvelope, FaPhone, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import axios from 'axios';

const ProfilePage = () => {
    const router = useRouter();
    const [user, setUser] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const response = await axios.get('http://localhost:3001/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(response.data);
                setFormData({
                    firstName: response.data.firstName,
                    lastName: response.data.lastName,
                    email: response.data.email,
                    phone: response.data.phone || '',
                });
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load profile');
                console.error('Profile load error:', err.response?.data || err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [router]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                'http://localhost:3001/api/users/profile',
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setUser(response.data);
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
            console.error('Update error:', err.response?.data || err.message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="bg-blue-600 px-6 py-4">
                        <h1 className="text-2xl font-bold text-white">Мой профиль</h1>
                    </div>

                    <div className="px-6 py-8">
                        {isEditing ? (
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            className="w-full px-4 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
                                            disabled
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="+7 (XXX) XXX-XX-XX"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-end space-x-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FaTimes className="inline mr-2" />
                                        Отмена
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FaSave className="inline mr-2" />
                                        Сохранить
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div>
                                <div className="flex items-center mb-8">
                                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mr-6">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                                        ) : (
                                            <FaUser className="text-3xl text-gray-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {user?.firstName} {user?.lastName}
                                        </h2>
                                        <p className="text-gray-600">{user?.email}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center">
                                        <FaEnvelope className="text-gray-500 mr-3" />
                                        <span className="text-gray-700">{user?.email}</span>
                                    </div>

                                    <div className="flex items-center">
                                        <FaPhone className="text-gray-500 mr-3" />
                                        <span className="text-gray-700">
                      {user?.phone || 'Не указан'}
                    </span>
                                    </div>
                                </div>

                                <div className="mt-8">
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <FaEdit className="inline mr-2" />
                                        Редактировать профиль
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;