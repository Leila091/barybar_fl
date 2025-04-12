// "use client";
// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import { FaHome, FaArrowLeft, FaImage, FaSave } from "react-icons/fa";
// import { FaFileCirclePlus } from "react-icons/fa6";
//
// const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => {
//     const router = useRouter();
//
//     return (
//         <nav className="flex mb-4 md:mb-6 overflow-x-auto py-2" aria-label="Хлебные крошки">
//             <ol className="flex items-center space-x-1 text-sm whitespace-nowrap">
//                 {items.map((item, index) => (
//                     <li key={index} className="flex items-center">
//                         {index > 0 && (
//                             <svg
//                                 className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0"
//                                 fill="currentColor"
//                                 viewBox="0 0 20 20"
//                             >
//                                 <path
//                                     fillRule="evenodd"
//                                     d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
//                                     clipRule="evenodd"
//                                 />
//                             </svg>
//                         )}
//                         {item.href ? (
//                             <a
//                                 href={item.href}
//                                 onClick={(e) => {
//                                     e.preventDefault();
//                                     router.push(item.href!);
//                                 }}
//                                 className="flex items-center hover:text-blue-600 transition-colors text-nowrap"
//                             >
//                                 {index === 0 && <FaHome className="h-3 w-3 mr-1 flex-shrink-0" />}
//                                 {item.label}
//                             </a>
//                         ) : (
//                             <span className="flex items-center text-gray-800 font-medium text-nowrap">
//                 {item.label}
//               </span>
//                         )}
//                     </li>
//                 ))}
//             </ol>
//         </nav>
//     );
// };
//
// const EditListing = () => {
//     const { id } = useParams();
//     const router = useRouter();
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [categories, setCategories] = useState([]);
//     const [formData, setFormData] = useState({
//         title: "",
//         description: "",
//         price: "",
//         priceType: "per_day",
//         quantity: "",
//         categoryId: "",
//         location: "",
//         startDate: "",
//         endDate: "",
//         mainPhoto: "",
//         photos: [] as string[],
//     });
//
//     const [newPhotos, setNewPhotos] = useState<File[]>([]);
//     const [preview, setPreview] = useState<string[]>([]);
//
//     let token: string | null = null;
//     let userId: number | null = null;
//
//     if (typeof window !== "undefined") {
//         token = localStorage.getItem("token");
//         if (!token) {
//             console.error("Токен не найден в localStorage");
//             setError("Токен не найден. Пожалуйста, авторизуйтесь.");
//             return;
//         }
//
//         try {
//             const decoded = JSON.parse(atob(token.split(".")[1]));
//             userId = decoded?.sub || null;
//
//             if (!userId) {
//                 console.error("User ID не найден в токене");
//                 setError("User ID не найден в токене.");
//                 return;
//             }
//         } catch (error) {
//             console.error("Ошибка при декодировании токена:", error);
//             setError("Ошибка при декодировании токена. Пожалуйста, авторизуйтесь снова.");
//             return;
//         }
//     }
//
//     useEffect(() => {
//         if (!id) {
//             setError("ID объявления не найден");
//             return;
//         }
//
//         if (!userId || !token) {
//             setError("Токен или User ID отсутствуют");
//             return;
//         }
//
//         const fetchListing = async () => {
//             setLoading(true);
//             try {
//                 const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
//                     headers: { Authorization: `Bearer ${token}` },
//                 });
//
//                 if (!response.ok) {
//                     const errorData = await response.json();
//                     throw new Error(errorData.message || "Ошибка при загрузке объявления");
//                 }
//
//                 const data = await response.json();
//
//                 let photosArray: string[] = [];
//                 if (typeof data.photos === "string") {
//                     const cleanedString = data.photos.replace(/[{}"]/g, "");
//                     photosArray = cleanedString.split(",");
//                 } else if (Array.isArray(data.photos)) {
//                     photosArray = data.photos;
//                 }
//
//                 setFormData({
//                     title: data.title || "",
//                     description: data.description || "",
//                     price: data.price || "",
//                     priceType: data.priceType || "per_day",
//                     quantity: data.quantity || "",
//                     categoryId: data.categoryId ? Number(data.categoryId) : "",
//                     location: data.location || "",
//                     startDate: data.startDate ? data.startDate.split("T")[0] : "",
//                     endDate: data.endDate ? data.endDate.split("T")[0] : "",
//                     mainPhoto: data.mainPhoto || "",
//                     photos: photosArray,
//                 });
//             } catch (err) {
//                 setError(err.message || "Ошибка при загрузке объявления");
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchListing();
//     }, [id, userId, token]);
//
//     useEffect(() => {
//         const fetchCategories = async () => {
//             try {
//                 const response = await fetch("http://localhost:3001/api/category");
//                 const data = await response.json();
//                 setCategories(data);
//             } catch (err) {
//                 setError("Ошибка при загрузке категорий");
//             }
//         };
//
//         fetchCategories();
//     }, []);
//
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({ ...prev, [name]: value }));
//     };
//
//     const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = Array.from(e.target.files || []);
//         if (files.length > 20) {
//             alert("Можно загрузить не более 20 фото!");
//             return;
//         }
//         setNewPhotos(files);
//         setPreview(files.map((file) => URL.createObjectURL(file)));
//     };
//
//     const handleDeleteExistingPhoto = (index: number) => {
//         const photoToDelete = formData.photos[index];
//         setDeletedPhotos((prev) => [...prev, photoToDelete]);
//
//         setFormData((prev) => {
//             const updatedPhotos = [...prev.photos];
//             updatedPhotos.splice(index, 1);
//             return { ...prev, photos: updatedPhotos };
//         });
//     };
//
// // Inside the form JSX
//     {formData.photos.length > 0 && (
//         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//             {formData.photos.map((src, index) => (
//                 <div key={index} className="relative">
//                     <img
//                         src={src}
//                         alt="existing"
//                         className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
//                     />
//                     <button
//                         type="button"
//                         onClick={() => handleDeleteExistingPhoto(index)}
//                         className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                     >
//                         ×
//                     </button>
//                 </div>
//             ))}
//         </div>
//     )}
//
//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//
//         if (!token) {
//             alert("Вы не авторизованы!");
//             return;
//         }
//
//         try {
//             let photoUrls: string[] = [];
//
//             if (newPhotos.length > 0) {
//                 photoUrls = await Promise.all(
//                     newPhotos.map(async (file) => {
//                         const formData = new FormData();
//                         formData.append("files", file);
//
//                         const response = await fetch("http://localhost:3001/api/listings/upload-photos", {
//                             method: "POST",
//                             headers: {
//                                 Authorization: `Bearer ${token}`,
//                             },
//                             body: formData,
//                         });
//
//                         if (!response.ok) {
//                             throw new Error("Ошибка загрузки фото");
//                         }
//
//                         const data = await response.json();
//                         return data.urls[0];
//                     })
//                 );
//             }
//
//             const payload = {
//                 title: formData.title,
//                 description: formData.description,
//                 price: Number(formData.price),
//                 categoryId: Number(formData.categoryId),
//                 location: formData.location,
//                 startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
//                 endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
//                 photos: newPhotos.length > 0 ? [...formData.photos, ...photoUrls] : formData.photos,
//             };
//
//             console.log('Отправляемые данные:', payload);
//
//             const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
//                 method: "PATCH",
//                 headers: {
//                     "Content-Type": "application/json",
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify(payload),
//             });
//
//             const responseData = await response.json();
//
//             if (!response.ok) {
//                 throw new Error(responseData.message || "Ошибка при обновлении объявления");
//             }
//
//             alert("Объявление успешно обновлено!");
//             router.push("/listing/my-listings");
//         } catch (error: any) {
//             console.error('Ошибка при сохранении:', error);
//             setError(error.message || "Ошибка при обновлении объявления");
//         }
//     };
//
//     if (loading) return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
//             <div className="text-center">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//                 <p className="text-gray-600">Загрузка объявления...</p>
//             </div>
//         </div>
//     );
//
//     if (error) return (
//         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
//             <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
//                 <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка</h2>
//                 <p className="text-gray-700 mb-6">{error}</p>
//                 <button
//                     onClick={() => router.push("/")}
//                     className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                     На главную
//                 </button>
//             </div>
//         </div>
//     );
//
//     return (
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 px-4 sm:px-6">
//             <div className="max-w-3xl mx-auto">
//                 <div className="flex items-center justify-between mb-6">
//                     <button
//                         onClick={() => router.back()}
//                         className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
//                     >
//                         <FaArrowLeft className="mr-2" /> Назад
//                     </button>
//                     <Breadcrumbs
//                         items={[
//                             { label: "Главная", href: "/" },
//                             { label: "Мои объявления", href: "/listing/my-listings" },
//                             { label: "Редактирование" }
//                         ]}
//                     />
//                 </div>
//
//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//                     <div className="p-6 sm:p-8">
//                         <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">
//                             Редактирование объявления
//                         </h1>
//
//                         <form onSubmit={handleSubmit} className="space-y-5">
//                             <div className="grid grid-cols-1 gap-5">
//                                 {/* Заголовок */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
//                                     <input
//                                         type="text"
//                                         name="title"
//                                         value={formData.title}
//                                         onChange={handleChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
//                                         required
//                                     />
//                                 </div>
//
//                                 {/* Описание */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
//                                     <textarea
//                                         name="description"
//                                         value={formData.description}
//                                         onChange={handleChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition h-32 text-sm sm:text-base"
//                                         required
//                                     />
//                                 </div>
//
//                                 {/* Цена и тип цены */}
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
//                                         <input
//                                             type="number"
//                                             name="price"
//                                             value={formData.price}
//                                             onChange={handleChange}
//                                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Тип цены</label>
//                                         <select
//                                             name="priceType"
//                                             value={formData.priceType}
//                                             onChange={handleChange}
//                                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white text-sm sm:text-base"
//                                             required
//                                         >
//                                             <option value="per_day">За день</option>
//                                             <option value="per_unit">За количество</option>
//                                             <option value="fixed">Фиксированная</option>
//                                         </select>
//                                     </div>
//                                 </div>
//
//                                 {/* Количество (показывается только для типа цены "per_unit") */}
//                                 {formData.priceType === "per_unit" && (
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
//                                         <input
//                                             type="number"
//                                             name="quantity"
//                                             value={formData.quantity}
//                                             onChange={handleChange}
//                                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
//                                         />
//                                     </div>
//                                 )}
//
//                                 {/* Категория и местоположение */}
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
//                                         <select
//                                             name="categoryId"
//                                             value={formData.categoryId}
//                                             onChange={handleChange}
//                                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white text-sm sm:text-base"
//                                             required
//                                         >
//                                             <option value="">Выберите категорию</option>
//                                             {categories.map((category) => (
//                                                 <option key={category.id} value={category.id}>
//                                                     {category.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
//                                         <input
//                                             type="text"
//                                             name="location"
//                                             value={formData.location}
//                                             onChange={handleChange}
//                                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//
//                                 {/* Даты */}
//                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
//                                         <input
//                                             type="date"
//                                             name="startDate"
//                                             value={formData.startDate}
//                                             onChange={handleChange}
//                                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
//                                             required
//                                         />
//                                     </div>
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
//                                         <input
//                                             type="date"
//                                             name="endDate"
//                                             value={formData.endDate}
//                                             onChange={handleChange}
//                                             className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
//                                             required
//                                         />
//                                     </div>
//                                 </div>
//
//                                 {/* Фото */}
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         <div className="flex items-center">
//                                             <FaFileCirclePlus className="mr-2 text-blue-500" />
//                                             Загрузите новые фото
//                                         </div>
//                                     </label>
//                                     <input
//                                         type="file"
//                                         multiple
//                                         onChange={handleFileChange}
//                                         className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-gray-50 text-sm sm:text-base"
//                                         accept="image/*"
//                                     />
//                                     <p className="mt-1 text-xs text-gray-500">Максимум 20 файлов</p>
//                                 </div>
//
//                                 {/* Превью новых фото */}
//                                 {preview.length > 0 && (
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             <div className="flex items-center">
//                                                 <FaImage className="mr-2 text-blue-500" />
//                                                 Превью новых фото
//                                             </div>
//                                         </label>
//                                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                                             {preview.map((src, index) => (
//                                                 <div key={index} className="relative">
//                                                     <img
//                                                         src={src}
//                                                         alt="preview"
//                                                         className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
//                                                     />
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//
//                                 {/* Существующие фото */}
//                                 {formData.photos.length > 0 && (
//                                     <div>
//                                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                                             <div className="flex items-center">
//                                                 <FaImage className="mr-2 text-blue-500" />
//                                                 Текущие фото
//                                             </div>
//                                         </label>
//                                         <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
//                                             {formData.photos.map((src, index) => (
//                                                 <div key={index} className="relative">
//                                                     <img
//                                                         src={src}
//                                                         alt="existing"
//                                                         className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
//                                                         onError={(e) => {
//                                                             (e.target as HTMLImageElement).style.display = 'none';
//                                                         }}
//                                                     />
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}
//                             </div>
//
//                             <button
//                                 type="submit"
//                                 className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg font-semibold flex items-center justify-center"
//                             >
//                                 <FaSave className="mr-2" />
//                                 Сохранить изменения
//                             </button>
//                         </form>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };
//
// export default EditListing;

"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FaHome, FaArrowLeft, FaImage, FaSave } from "react-icons/fa";
import { FaFileCirclePlus } from "react-icons/fa6";

const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => {
    const router = useRouter();

    return (
        <nav className="flex mb-4 md:mb-6 overflow-x-auto py-2" aria-label="Хлебные крошки">
            <ol className="flex items-center space-x-1 text-sm whitespace-nowrap">
                {items.map((item, index) => (
                    <li key={index} className="flex items-center">
                        {index > 0 && (
                            <svg
                                className="h-4 w-4 mx-1 text-gray-400 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        )}
                        {item.href ? (
                            <a
                                href={item.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    router.push(item.href!);
                                }}
                                className="flex items-center hover:text-blue-600 transition-colors text-nowrap"
                            >
                                {index === 0 && <FaHome className="h-3 w-3 mr-1 flex-shrink-0" />}
                                {item.label}
                            </a>
                        ) : (
                            <span className="flex items-center text-gray-800 font-medium text-nowrap">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

const EditListing = () => {
    const { id } = useParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        priceType: "per_day",
        quantity: "",
        categoryId: "",
        location: "",
        startDate: "",
        endDate: "",
        mainPhoto: "",
        photos: [] as string[],
    });

    const [newPhotos, setNewPhotos] = useState<File[]>([]);
    const [preview, setPreview] = useState<string[]>([]);
    const [deletedPhotos, setDeletedPhotos] = useState<string[]>([]);

    let token: string | null = null;
    let userId: number | null = null;

    if (typeof window !== "undefined") {
        token = localStorage.getItem("token");
        if (!token) {
            console.error("Токен не найден в localStorage");
            setError("Токен не найден. Пожалуйста, авторизуйтесь.");
            return;
        }

        try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            userId = decoded?.sub || null;

            if (!userId) {
                console.error("User ID не найден в токене");
                setError("User ID не найден в токене.");
                return;
            }
        } catch (error) {
            console.error("Ошибка при декодировании токена:", error);
            setError("Ошибка при декодировании токена. Пожалуйста, авторизуйтесь снова.");
            return;
        }
    }

    useEffect(() => {
        if (!id) {
            setError("ID объявления не найден");
            return;
        }

        if (!userId || !token) {
            setError("Токен или User ID отсутствуют");
            return;
        }

        const fetchListing = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Ошибка при загрузке объявления");
                }

                const data = await response.json();

                let photosArray: string[] = [];
                if (typeof data.photos === "string") {
                    const cleanedString = data.photos.replace(/[{}"]/g, "");
                    photosArray = cleanedString.split(",");
                } else if (Array.isArray(data.photos)) {
                    photosArray = data.photos;
                }

                setFormData({
                    title: data.title || "",
                    description: data.description || "",
                    price: data.price || "",
                    priceType: data.priceType || "per_day",
                    quantity: data.quantity || "",
                    categoryId: data.categoryId ? Number(data.categoryId) : "",
                    location: data.location || "",
                    startDate: data.startDate ? data.startDate.split("T")[0] : "",
                    endDate: data.endDate ? data.endDate.split("T")[0] : "",
                    mainPhoto: data.mainPhoto || "",
                    photos: photosArray,
                });
            } catch (err) {
                setError(err.message || "Ошибка при загрузке объявления");
            } finally {
                setLoading(false);
            }
        };

        fetchListing();
    }, [id, userId, token]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch("http://localhost:3001/api/category");
                const data = await response.json();
                setCategories(data);
            } catch (err) {
                setError("Ошибка при загрузке категорий");
            }
        };

        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 20) {
            alert("Можно загрузить не более 20 фото!");
            return;
        }
        setNewPhotos(files);
        setPreview(files.map((file) => URL.createObjectURL(file)));
    };

    const handleDeleteExistingPhoto = (index: number) => {
        const photoToDelete = formData.photos[index];
        setDeletedPhotos((prev) => [...prev, photoToDelete]);

        setFormData((prev) => {
            const updatedPhotos = [...prev.photos];
            updatedPhotos.splice(index, 1);
            return { ...prev, photos: updatedPhotos };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            alert("Вы не авторизованы!");
            return;
        }

        try {
            let photoUrls: string[] = [];

            if (newPhotos.length > 0) {
                photoUrls = await Promise.all(
                    newPhotos.map(async (file) => {
                        const formData = new FormData();
                        formData.append("files", file);

                        const response = await fetch("http://localhost:3001/api/listings/upload-photos", {
                            method: "POST",
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                            body: formData,
                        });

                        if (!response.ok) {
                            throw new Error("Ошибка загрузки фото");
                        }

                        const data = await response.json();
                        return data.urls[0];
                    })
                );
            }

            const payload = {
                title: formData.title,
                description: formData.description,
                price: Number(formData.price),
                categoryId: Number(formData.categoryId),
                location: formData.location,
                startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
                endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
                photos: newPhotos.length > 0 ? [...formData.photos, ...photoUrls] : formData.photos,
                deletedPhotos, // Include deleted photos
            };

            console.log("Отправляемые данные:", payload);

            const response = await fetch(`http://localhost:3001/api/listings/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (!response.ok) {
                throw new Error(responseData.message || "Ошибка при обновлении объявления");
            }

            alert("Объявление успешно обновлено!");
            router.push("/listing/my-listings");
        } catch (error: any) {
            console.error("Ошибка при сохранении:", error);
            setError(error.message || "Ошибка при обновлении объявления");
        }
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Загрузка объявления...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 p-4">
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-2">Ошибка</h2>
                    <p className="text-gray-700 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        На главную
                    </button>
                </div>
            </div>
        );

        return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-6 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <FaArrowLeft className="mr-2" /> Назад
                    </button>
                    <Breadcrumbs
                        items={[
                            { label: "Главная", href: "/" },
                            { label: "Мои объявления", href: "/listing/my-listings" },
                            { label: "Редактирование" }
                        ]}
                    />
                </div>

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 sm:p-8">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-900">
                            Редактирование объявления
                        </h1>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 gap-5">
                                {/* Заголовок */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Название</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                {/* Описание */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition h-32 text-sm sm:text-base"
                                        required
                                    />
                                </div>

                                {/* Цена и тип цены */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Цена</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Тип цены</label>
                                        <select
                                            name="priceType"
                                            value={formData.priceType}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white text-sm sm:text-base"
                                            required
                                        >
                                            <option value="per_day">За день</option>
                                            <option value="per_unit">За количество</option>
                                            <option value="fixed">Фиксированная</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Количество (показывается только для типа цены "per_unit") */}
                                {formData.priceType === "per_unit" && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Количество</label>
                                        <input
                                            type="number"
                                            name="quantity"
                                            value={formData.quantity}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
                                        />
                                    </div>
                                )}

                                {/* Категория и местоположение */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition bg-white text-sm sm:text-base"
                                            required
                                        >
                                            <option value="">Выберите категорию</option>
                                            {categories.map((category) => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Местоположение</label>
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Даты */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала</label>
                                        <input
                                            type="date"
                                            name="startDate"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания</label>
                                        <input
                                            type="date"
                                            name="endDate"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition text-sm sm:text-base"
                                            required
                                        />
                                    </div>
                                </div>
                                {/* Фото */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Фото
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-300 focus:border-blue-300"
                                        multiple
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Максимум 20 файлов</p>
                                </div>

                                {/* Превью новых фото */}
                                {preview.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {preview.map((url, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index}`}
                                                    className="w-16 h-16 object-cover rounded border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newPhotosCopy = [...newPhotos];
                                                        const newPreview = [...preview];
                                                        newPhotosCopy.splice(index, 1);
                                                        newPreview.splice(index, 1);
                                                        setNewPhotos(newPhotosCopy);
                                                        setPreview(newPreview);
                                                    }}
                                                    className="absolute -top-1 -right-1 bg-red-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-500"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Существующие фото */}
                                {formData.photos.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {formData.photos.map((src, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={src}
                                                    alt="existing"
                                                    className="w-full h-24 sm:h-32 object-cover rounded-lg border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteExistingPhoto(index)}
                                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors shadow-lg font-semibold flex items-center justify-center"
                            >
                                <FaSave className="mr-2" />
                                Сохранить изменения
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditListing;