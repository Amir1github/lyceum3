import { useState, useEffect } from 'react';

export default function Footer() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Для управления модалкой
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isClient, setIsClient] = useState(false); // Состояние для проверки клиента

  // Проверяем значение из localStorage при монтировании компонента
  useEffect(() => {
    // Устанавливаем флаг, что код выполняется на клиенте
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Не выполняем этот код на сервере

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
  }, [isClient]);

  const handlePasswordSubmit = () => {
    if (password === '052') {
      localStorage.setItem('AdminPas', '052'); // Сохраняем пароль в localStorage
      setIsAdmin(true); // Устанавливаем состояние в true
      setIsModalOpen(false); // Закрываем модалку
      setPasswordError(''); // Очищаем ошибку
      window.location.reload(); // Перезагрузка страницы
    } else {
      setPasswordError('Неверный пароль! Попробуйте еще раз.');
    }
  };

  const handleBecomeUser = () => {
    localStorage.setItem('AdminPas', 'none'); // Сбрасываем значение в localStorage
    setIsAdmin(false); // Сбрасываем состояние
    window.location.reload(); // Перезагрузка страницы
  };

  return (
    <footer className="bg-black text-white py-10">
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-semibold mb-4 text-black">Введите пароль администратора</h2>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-gray-300 p-2 w-full mb-4 text-black"
              placeholder="Пароль"
            />
            {passwordError && <p className="text-red-500 mb-4">{passwordError}</p>}
            <div className="flex justify-between">
              <button
                onClick={handlePasswordSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                Подтвердить
              </button>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center md:items-start px-4">
        {/* Логотип */}
        <div className="mb-8 md:mb-0">
          <img
            className="w-[100px] h-[100px] mx-auto md:mx-0"
            src="/assets/logo.png"
            alt="Logo"
          />
        </div>

        {/* Справочная информация */}
        <div className="mb-8 md:mb-0">
          <p className="font-bold text-gray-400 mb-4 text-center md:text-left">Справка</p>
          <ul className="space-y-2 text-center md:text-left">
            <li>
              <a href="/chat" className="hover:text-gray-400 transition">Общий чат</a>
            </li>
            <li>
              <a href="/" className="hover:text-gray-400 transition">О нас</a>
            </li>
            <li>
              <a href="/vacancies" className="hover:text-gray-400 transition">Вакансии</a>
            </li>
            <li>
              <a href="/news" className="hover:text-gray-400 transition">Новости Lyceum №3</a>
            </li>
            <li>
              {!isAdmin && (
                <button onClick={() => setIsModalOpen(true)} className="text-blue-500">
                  Стать Админом
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleBecomeUser}
                  className="text-blue-500"
                >
                  Стать пользователем
                </button>
              )}
            </li>
          </ul>
        </div>

        {/* Донат */}
        <div className="w-full md:w-1/3 lg:w-1/4">
          <div className="border-gray-600 border-2 p-4 rounded-xl flex flex-col items-center text-center">
            <img src='/assets/qr-code.jpg' alt="QR Code" />
            <p className="text-sm text-gray-400 mb-4">Донат для веб-сайта</p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://www.facebook.com/litseyi3"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="App Store"
              >
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="30" height="30" viewBox="0 0 40 40">
                  <path fill="#8bb7f0" d="M2.5 2.5H37.5V37.5H2.5z"></path>
                  <path fill="#4e7ab5" d="M37,3v34H3V3H37 M38,2H2v36h36V2L38,2z"></path>
                  <path fill="#fff" d="M27,37V24h4.93l0.698-5H27v-3.384c0-1.568,0.702-2.636,2.95-2.636L33,12.979V8.225	c-0.496-0.066-2.381-0.213-4.361-0.213c-4.134,0-6.639,2.523-6.639,7.157V19h-5v5h5v13H27z"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-gray-400 font-bold pt-4 text-center text-sm">
        © 2024 СОУ «Лицей №3 барои кудакони болаекат». кӯч. Маҳмадулло Холов, н. И. Сомонӣ 33, Душанбе
      </div>
    </footer>
  );
}
