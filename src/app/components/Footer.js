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
    if (password === 'h586t') {
      localStorage.setItem('AdminPas', 'h586t'); // Сохраняем пароль в localStorage
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
            {passwordError && <p className="text-red-700 mb-4">{passwordError}</p>}
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
            className="w-[150px] h-[150px] mx-auto md:mx-0"
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
              <a href="/news" className="hover:text-gray-400 transition">Новости Kafolat  </a>
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
            <p className="text-sm text-gray-400 mb-4">Следите за новостями в соцсетях</p>
            <div className='flex gap-5'>
            <div className="flex justify-center space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=129761550559062"
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
            <div className="flex justify-center space-x-4">
              <a
                href="https://www.instagram.com/_kafolat_/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="App Store"
              >
                <svg
  id="instagram"
  fill="rgb(217, 50, 117)"
  viewBox="0 0 169.063 169.063"
  width="30"
  height="30"
  xmlns="http://www.w3.org/2000/svg"
>
  <g>
    <path d="M122.406,0H46.654C20.929,0,0,20.93,0,46.655v75.752c0,25.726,20.929,46.655,46.654,46.655h75.752
      c25.727,0,46.656-20.93,46.656-46.655V46.655C169.063,20.93,148.133,0,122.406,0z M154.063,122.407
      c0,17.455-14.201,31.655-31.656,31.655H46.654C29.2,154.063,15,139.862,15,122.407V46.655C15,29.201,29.2,15,46.654,15h75.752
      c17.455,0,31.656,14.201,31.656,31.655V122.407z" />
    <path d="M84.531,40.97c-24.021,0-43.563,19.542-43.563,43.563c0,24.02,19.542,43.561,43.563,43.561s43.563-19.541,43.563-43.561
      C128.094,60.512,108.552,40.97,84.531,40.97z M84.531,113.093c-15.749,0-28.563-12.812-28.563-28.561
      c0-15.75,12.813-28.563,28.563-28.563s28.563,12.813,28.563,28.563C113.094,100.281,100.28,113.093,84.531,113.093z" />
    <path d="M129.921,28.251c-2.89,0-5.729,1.17-7.77,3.22c-2.051,2.04-3.23,4.88-3.23,7.78c0,2.891,1.18,5.73,3.23,7.78
      c2.04,2.04,4.88,3.22,7.77,3.22c2.9,0,5.73-1.18,7.78-3.22c2.05-2.05,3.22-4.89,3.22-7.78c0-2.9-1.17-5.74-3.22-7.78
      C135.661,29.421,132.821,28.251,129.921,28.251z" />
  </g>
</svg>

              </a>
            </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 text-gray-400 font-bold pt-4 text-center text-sm">
        © 2025 СОУ «Гимназия Кафолат». Душанбе, просп. Нусратулло Махсума, 77/6
      </div>
    </footer>
  );
}
