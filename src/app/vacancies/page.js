'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import '@/app/styles/loader.css';
const Vacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Данные для новой вакансии
  const [newVacancy, setNewVacancy] = useState({
    position: '',
    salary: '',
    hoursPerWeek: '',
    description: '',
    requirements: '', // Новое свойство "Требования"
  });

  // Загружаем вакансии из API
  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const response = await fetch('/api/vacancies');
        if (response.ok) {
          const data = await response.json();
          setVacancies(data);
        } else {
          throw new Error('Ошибка загрузки вакансий');
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Проверка, является ли пользователь администратором
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

    fetchVacancies();
  }, []);

  // Обработка отправки новой вакансии
  const handleAddVacancy = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch('/api/vacancies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newVacancy),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении вакансии');
      }

      const createdVacancy = await response.json();
      setVacancies((prev) => [...prev, createdVacancy]);

      // Очистка формы
      setNewVacancy({
        position: '',
        salary: '',
        hoursPerWeek: '',
        description: '',
        requirements: '', // Очистка нового поля
      });
    } catch (error) {
      setError(error.message);
    }
  };

  // Обработка удаления вакансии
  const handleDeleteVacancy = async (id) => {
    try {
      const response = await fetch(`/api/vacancies?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка при удалении вакансии');
      }

      // Удаляем вакансию из списка
      setVacancies((prev) => prev.filter((vacancy) => vacancy.id !== id));
    } catch (error) {
      setError(error.message);
    }
  };
  if (loading){
    return <div className='flex justify-center items-center flex-col gap-[30px]'><p className="text-center mt-8">Загрузка данных...</p><div className="loader"></div></div>;
  }
  return (
    <>
      <Navbar />
      <div className="vacancies-container bg-gray-100 p-6 rounded-lg shadow-md max-w-4xl mx-auto mb-10 mt-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Вакансии</h2>

        {/* Список вакансий */}
        {loading ? (
          <div className='flex justify-center items-center flex-col gap-[30px]'><p className="text-center mt-8">Загрузка данных...</p><div className="loader"></div></div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
            <div className="space-y-4">
            {vacancies.map((vacancy) => (
              <div
                key={vacancy.id}
                className="vacancy bg-white p-4 rounded-lg shadow-sm border border-gray-300"
              >
                <h3 className="text-xl font-bold">{vacancy.position}</h3>
                <p>
                  <strong>Зарплата:</strong> {vacancy.salary} $
                </p>
                <p>
                  <strong>Часы в неделю:</strong> {vacancy.hoursPerWeek}
                </p>
                <p>{vacancy.description}</p>
                <p><strong>Требования:</strong> {vacancy.requirements}</p>
          
                {/* Кнопка "Связаться" */}
                <button
                  className="text-blue-500 px-4 py-2 rounded-lg mt-2"
                  onClick={() => handleContact(vacancy.id)} // Функция для обработки кнопки "Связаться"
                >
                  Связаться
                </button>
          
                {isAdmin && (
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2 hover:bg-red-600"
                    onClick={() => handleDeleteVacancy(vacancy.id)}
                  >
                    Удалить
                  </button>
                )}
              </div>
            ))}
          </div>
          
        )}

        {/* Форма добавления вакансий для администратора */}
        {isAdmin && (
          <div className="mt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Добавить новую вакансию
            </h3>
            <form
              className="space-y-4 bg-white p-4 rounded-lg shadow-sm border border-gray-300"
              onSubmit={handleAddVacancy}
            >
              <input
                type="text"
                placeholder="Должность"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newVacancy.position}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, position: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Зарплата ($)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newVacancy.salary}
                onChange={(e) =>
                  setNewVacancy({ ...newVacancy, salary: e.target.value })
                }
                required
              />
              <input
                type="number"
                placeholder="Часы в неделю"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={newVacancy.hoursPerWeek}
                onChange={(e) =>
                  setNewVacancy({
                    ...newVacancy,
                    hoursPerWeek: e.target.value,
                  })
                }
                required
              />
              <textarea
                placeholder="Описание"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows="4"
                value={newVacancy.description}
                onChange={(e) =>
                  setNewVacancy({
                    ...newVacancy,
                    description: e.target.value,
                  })
                }
                required
              ></textarea>
              <textarea
                placeholder="Требования"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                rows="4"
                value={newVacancy.requirements}
                onChange={(e) =>
                  setNewVacancy({
                    ...newVacancy,
                    requirements: e.target.value,
                  })
                }
                required
              ></textarea>
              <button
                type="submit"
                className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 transition duration-200"
              >
                Добавить вакансию
              </button>
            </form>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Vacancies;
