'use client';
import { useState, useEffect } from "react";
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
export default function NewsDetails({ params }) {
  const { id } = params; // Извлекаем id из параметров маршрута
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true); // Устанавливаем начальное состояние загрузки
  const [error, setError] = useState(null); // Для обработки ошибок

  // Получаем URL API из переменных окружения
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) {
          throw new Error('API URL is not defined in environment variables');
        }

        const res = await fetch(`${apiUrl}/api/news/${id}`, {
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error('Новость не найдена');
        }

        const data = await res.json();
        setNewsItem(data); // Устанавливаем данные новости
      } catch (err) {
        setError(err.message); // Устанавливаем сообщение об ошибке
      } finally {
        setLoading(false); // Завершаем загрузку
      }
    };

    fetchData();
  }, [apiUrl, id]);

  if (loading) {
    return (
      <div className='flex justify-center items-center flex-col gap-[30px]'><p className="text-center mt-8">Загрузка данных...</p><div className="loader"></div></div>);
  }

  if (error) {
    return <p className="text-red-600 text-center mt-8">Ошибка: {error}</p>;
  }

  if (!newsItem) {
    return <p className="text-center mt-8">Новость не найдена</p>;
  }

  return (
    <>
    <Navbar />
    
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center sm:text-left">{newsItem.title}</h1>
      <div className="text-lg text-gray-700 mb-6 whitespace-pre-line">
        {newsItem.content}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {newsItem.images?.map((img, idx) => (
          <div
            key={idx}
            className="relative group overflow-hidden rounded-lg shadow-lg transition-transform transform hover:scale-105"
          >
            <img
              src={img}
              alt={`Новость ${newsItem.id} - изображение ${idx + 1}`}
              className="w-full h-full object-cover rounded-lg transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <p className="text-white text-xl font-semibold">Изображение {idx + 1}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="text-gray-500">Дата: {new Date(newsItem.createdAt).toLocaleString()}</p>
    </div>
    <Footer />
    </>
  );
}
