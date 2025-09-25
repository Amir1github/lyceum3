'use client';
import { useState, useEffect, useRef } from 'react';
import SendMessage from '../components/sendmessage';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import '@/app/styles/loader.css';
const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ссылка на контейнер сообщений
  const messagesEndRef = useRef(null);

  // Проверка, является ли пользователь администратором
  const [isAdmin, setIsAdmin] = useState(false);

  // Загружаем сообщения из messages.json
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch('/api/messages');
        if (response.ok) {
          const data = await response.json();
          setMessages(data);
        } else {
          console.error('Ошибка загрузки сообщений');
        }
      } catch (error) {
        console.error('Ошибка при подключении к серверу', error);
      } finally {
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
    fetchMessages();
  }, []);

  // Прокручиваем вниз при каждом обновлении сообщений
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Удаление одного сообщения
  const handleDelete = async (name, email, message) => {
    try {
      const response = await fetch('/api/messages', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении сообщения');
      }
      // Удаляем сообщение из локального состояния
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.name !== name || msg.email !== email || msg.message !== message)
      );
      console.log('Сообщение удалено');
    } catch (error) {
      console.error('Ошибка при удалении сообщения', error);
    }
  };

  // Очистка всех сообщений
  const handleClearAll = async () => {
    try {
      const response = await fetch('/api/messages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clearAll: true }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при очистке чата');
      }
      setMessages([]); // Очищаем локальное состояние
      console.log('Чат очищен');
    } catch (error) {
      console.error('Ошибка при очистке чата', error);
    }
  };

  return (
    <>
      <Navbar />

      <div className="chat-container bg-gray-100 p-6 rounded-lg shadow-md max-w-xl mx-auto mb-[30px] mt-[30px]">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Чат</h2>

        {/* Чат, показывающий список сообщений */}
        <div className="messages-list space-y-4 mb-6 overflow-y-auto h-80 p-4 border border-gray-300 rounded-lg">
          {loading ? (
            <p>Загрузка сообщений...</p>
          ) : (
            messages.map((msg) => (
              <div
                key={`${msg.name}-${msg.email}-${msg.message}`}
                className={`message p-4 rounded-lg shadow-sm ${
                  msg.admin ? 'bg-blue-500 text-white self-end' : 'bg-white'
                }`}
                style={msg.admin ? { alignSelf: 'flex-end', maxWidth: '70%' } : {}}
              >
                <div className="flex justify-between">
                  <strong>{msg.name}</strong>
                  <span className="text-sm">
  {msg.created_at ? new Date(msg.created_at).toLocaleString() : "—"}
</span>

                </div>
                <p>{msg.message}</p>

                {/* Кнопка удаления для админа */}
                {isAdmin && (
                  <button
                    className={`px-4 py-1 rounded-lg mt-2 ${
                      msg.admin ? 'bg-red-700 text-white' : 'bg-red-700 text-white'
                    }`}
                    onClick={() => handleDelete(msg.name, msg.email, msg.message)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))
          )}

          {/* Ссылка для прокрутки вниз */}
          <div ref={messagesEndRef} />
        </div>

        {/* Кнопка очистки чата для администратора */}
        {isAdmin && (
          <button
            className="bg-red-700 text-white px-6 py-2 rounded-lg shadow hover:bg-red-700 transition duration-200 w-full mb-4"
            onClick={handleClearAll}
          >
            Очистить весь чат
          </button>
        )}

        {/* Форма для отправки нового сообщения */}
        <SendMessage />
      </div>

      <Footer />
    </>
  );
};

export default Chat;
