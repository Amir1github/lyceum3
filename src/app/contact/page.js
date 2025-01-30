
'use client';

import React, { useEffect, useState } from "react";
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import Schedule from "../components/Schedule";
import Map from "./map";
import SendMessage from "../components/sendmessage";
import '@/app/styles/loader.css';
const Contact = () => {
  const [isAdmin, setIsAdmin] = useState(false); // Проверка на администратора
  const [contactInfo, setContactInfo] = useState(null); // Данные контактов
  const [editedInfo, setEditedInfo] = useState({}); // Изменённые данные контактов
  useEffect(()=>{
    const fetchContactInfo = async () => {
      try {
        const response = await fetch('/api/contactinfo');
        const data = await response.json();
        setContactInfo(data);
        setEditedInfo(data); // Копируем данные для редактирования
      } catch (error) {
        console.error('Ошибка при получении контактной информации:', error);
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
    fetchContactInfo();
  }, []);
 
  
  
  const handleInputChange = (field, value) => {
    setEditedInfo((prev) => ({ ...prev, [field]: value }));
  };

  // Сохранение изменений
  const handleSave = async () => {
    try {
      const response = await fetch('/api/contactinfo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedInfo),
      });

      if (response.ok) {
        const updatedInfo = await response.json();
        setContactInfo(updatedInfo);
        alert('Изменения успешно сохранены!');

      } else {
        alert('Не удалось сохранить изменения.');
      }
    } catch (error) {
      console.error('Ошибка при сохранении изменений:', error);
    }
  };

  if (!contactInfo) {
    return <div className='flex justify-center items-center flex-col gap-[30px]'><p className="text-center mt-8">Загрузка данных...</p><div className="loader"></div></div>;;
  }
  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Основной блок с картой и контактной информацией */}
        <div className="flex flex-wrap justify-between items-start gap-8">
          {/* Контактная информация */}
          <div className="w-[30px] lg:w-1/3 space-y-4">
            <h1 className="text-2xl font-bold text-gray-800">Контактная информация</h1>
            <div>
              <p className="text-lg">Адрес: кӯч. Маҳмадулло Холов, н. И. Сомонӣ 33, Душанбе</p>
              
            </div>
            <div>
              <p className="text-lg">Email:</p>
              {isAdmin ? (
                <input
                  type="email"
                  value={editedInfo.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <a href={`mailto:${contactInfo.email}`} className="text-blue-500 hover:underline">
                  {contactInfo.email}
                </a>
              )}
            </div>
            <div>
              <p className="text-lg">Telegram:</p>
              {isAdmin ? (
                <input
                  type="text"
                  value={editedInfo.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <a href={`https://t.me/${contactInfo.telegram}`} className="text-blue-500 hover:underline">
                  {contactInfo.telegram}
                </a>
              )}
            </div>
            <div>
              <p className="text-lg">Телефон для справок:</p>
              {isAdmin ? (
                <input
                  type="text"
                  value={editedInfo.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              ) : (
                <a href={`tel:${contactInfo.phone}`} className="text-blue-500 hover:underline">
                  {contactInfo.phone}
                </a>
              )}
            </div>
            {isAdmin && (
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-200"
          >
            Сохранить изменения
          </button>
        )}
          </div>

          <Schedule />
          <Map />
        </div>

      
        <SendMessage />
      </div>
      <Footer />
    </>
  );
};


export default Contact;