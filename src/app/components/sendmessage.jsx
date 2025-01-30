'use client';
import { useState, useEffect } from 'react';

const SendMessage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Проверка на администратора
  useEffect(() => {
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
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение формы

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/sendmessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          message,
          admin: isAdmin, // Добавляем свойство admin
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке сообщения');
      }

      const data = await response.json();
      console.log('Message sent:', data);

      // Очистить поля формы
      setName('');
      setEmail('');
      setMessage('');
      
      // Перезагрузить страницу после отправки
      window.location.reload();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        {isAdmin ? 'Отправить админское сообщение' : 'Отправить сообщение'}
      </h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            placeholder="Ваше имя"
            className="w-full lg:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Ваш email"
            className="w-full lg:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <textarea
          placeholder="Ваше сообщение"
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 outline-none ${
            isAdmin ? 'border-blue-500' : 'border-gray-300'
          }`}
          rows="4"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>
        <button
          type="submit"
          className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-200"
          disabled={loading}
        >
          {loading ? 'Отправка...' : isAdmin ? 'Отправить как админ' : 'Отправить сообщение'}
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
};

export default SendMessage;
