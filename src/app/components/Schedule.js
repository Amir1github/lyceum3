import React, { useState, useEffect } from 'react';

const Schedule = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editedSchedule, setEditedSchedule] = useState({});

  // Проверяем, является ли пользователь администратором
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

  // Получаем расписание с сервера
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await fetch('/api/workhour');
        const data = await response.json();
        setSchedule(data);
      } catch (error) {
        console.error('Ошибка при загрузке расписания:', error);
      }
    };

    fetchSchedule();
  }, []);

  // Проверяем, открыто ли сейчас
  useEffect(() => {
    const checkIfOpen = () => {
      const now = new Date();
      const currentDay = now.getDay(); // День недели (0 - воскресенье, 6 - суббота)
      const currentTime = now.getHours() * 60 + now.getMinutes(); // Текущее время в минутах

      const todaySchedule = schedule[currentDay === 0 ? 6 : currentDay - 1];
      if (!todaySchedule || todaySchedule.hours === 'Закрыто') {
        setIsOpen(false);
        return;
      }

      const [start, end] = todaySchedule.hours.split(' - ').map((time) => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
      });

      setIsOpen(currentTime >= start && currentTime <= end);
    };

    checkIfOpen();
    const interval = setInterval(checkIfOpen, 60000); // Проверяем каждую минуту

    return () => clearInterval(interval);
  }, [schedule]);

  // Обновление часов работы
  const handleScheduleChange = (day, value) => {
    // Обновляем как editedSchedule, так и schedule
    setEditedSchedule((prev) => {
      const newEditedSchedule = { ...prev, [day]: value };
      setSchedule((prevSchedule) =>
        prevSchedule.map((item) =>
          item.day === day ? { ...item, hours: value } : item
        )
      );
      return newEditedSchedule;
    });
  };

  // Отправка обновленного расписания на сервер
  const handleSaveSchedule = async () => {
    try {
      // Преобразуем объект в массив
      const updatedData = Object.entries(editedSchedule).map(([day, hours]) => ({
        day,
        hours,
      }));
  
      const response = await fetch('/api/workhour', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData), // Отправляем массив
      });
  
      if (response.ok) {
        const updatedSchedule = await response.json();
        setSchedule(updatedSchedule);
        setEditedSchedule({});
        alert('Расписание обновлено!');
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке данных:', error);
      alert('Ошибка при отправке данных.');
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold mb-4">График работы</h2>
  <ul className="space-y-2">
    {schedule.map((item, index) => (
      <li
        key={index}
        className={`flex justify-between items-center ${
          index === new Date().getDay() - 1 ||
          (new Date().getDay() === 0 && index === 6)
            ? 'font-bold text-blue-600'
            : 'text-gray-800'
        }`}
      >
        <span>{item.day}</span>
        {isAdmin ? (
          <input
            type="text"
            value={editedSchedule[item.day] || item.hours}
            onChange={(e) => handleScheduleChange(item.day, e.target.value)}
            className="border border-gray-300 p-1 rounded text-black sm:w-1/3 md:w-1/4 lg:w-1/6"
          />
        ) : (
          <span>{item.hours}</span>
        )}
      </li>
    ))}
  </ul>

  {isAdmin && (
    <div className="flex justify-center mt-4">
      <button
        onClick={handleSaveSchedule}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg w-full sm:w-1/2 md:w-1/3 lg:w-1/4"
      >
        Сохранить изменения
      </button>
    </div>
  )}

  <div
    className={`mt-4 p-4 text-center rounded-lg ${
      isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
    }`}
  >
    {isOpen ? 'Сейчас открыто' : 'Сейчас закрыто'}
  </div>
</div>

  );
};

export default Schedule;
