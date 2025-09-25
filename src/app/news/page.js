'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '@/app/styles/loader.css';
export default function NewsPage() {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', images: [] });
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert('У вас нет прав для удаления новостей');
      return;
    }

    try {
      const response = await fetch(`/api/news?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении новости');
      }

      // Обновляем список новостей
      setNews((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error('Error deleting news:', error);
    }
  };
  useEffect(() => {
    const fetchNews = async () => {
      try {
        
        const response = await fetch('/api/news');
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }finally {
        setLoading(false);
      }
    };
    const checkAdmin = async () => {
      try {
        const adminPassword = localStorage.getItem('AdminPas');
        const response = await fetch('/api/checkAdmin', {
          headers: { 'x-admin-password': adminPassword },
        });
  
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error('Ошибка проверки администратора:', error);
      }
    };
    checkAdmin();
    fetchNews();
    
  }, []);
  


  // Загрузка изображений на Cloudinary
  const uploadImages = async (files) => {
    const urls = [];
    const formData = new FormData();

    for (const file of files) {
      formData.append('file', file);
      formData.append('upload_preset', 'my_preset'); // Укажите свой upload_preset

      try {
        const response = await axios.post(
          'https://api.cloudinary.com/v1_1/dzbuo2vqt/image/upload',
          formData
        );
        urls.push(response.data.secure_url);
      } catch (error) {
        console.error('Error uploading image:', error);
      }finally{
       
        setLoading2(false);
  
      }
    }

    return urls; // Возвращаем массив URL загруженных изображений
  };
  
  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
        alert('У вас нет прав для добавления новостей');
        return;
      }
    // Загружаем изображения
    let imageUrls = [];
    if (form.images.length > 0) {
      imageUrls = await uploadImages(form.images);
    }

    const newNews = {
      title: form.title,
      content: form.content,
      images: imageUrls, 
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch('/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNews),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении новости');
      }

      const addedNews = await response.json();
      setNews((prev) => [...prev, addedNews.news]);
      setForm({ title: '', content: '', images: [] }); // Очистить форму
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding news:', error);
    }
  };
  if(loading || loading2){
    return <div className='flex justify-center items-center flex-col gap-[30px]'><p className="text-center mt-8">Загрузка данных...</p><div className="loader"></div></div>;
  }
  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center mb-[30px]">
        <h1 className="font-bold text-[30px] mb-[20px]">Новости</h1>

        {news.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 shadow-md bg-white">
                <Link href={`/news/${item.id}`} passHref>
                  <div className="cursor-pointer">
                    <h2 className="text-lg font-semibold mb-2 truncate">{item.title}</h2>
                    <p className="text-gray-600 mb-4 truncate">{item.content}</p>
                    <div
                      className="grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-40"
                      style={{ scrollbarWidth: 'thin' }}
                    >
                      {item.images &&
                        item.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={img}
                              alt={`Новость ${item.id} - изображение ${idx + 1}`}
                              className="w-full h-28 object-cover rounded-lg border"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                              <p className="text-white text-xs">Изображение {idx + 1}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                    <p className="text-[gray]">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                </Link>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="mt-4 bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">Нет новостей</p>
        )}

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg"
          >
            Добавить новость
          </button>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
              <h2 className="text-xl font-semibold mb-4">Добавить новость</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  placeholder="Заголовок"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full p-2 border rounded-md mb-4"
                />
                <textarea
                  placeholder="Содержимое"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  required
                  className="w-full p-2 border rounded-md mb-4"
                ></textarea>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setForm({ ...form, images: [...e.target.files] })}
                  className="mb-4"
                />
                <div className="flex justify-between">
                  <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded-lg">
                    Добавить
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-red-700 text-white px-4 py-2 rounded-lg"
                  >
                    Закрыть
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
