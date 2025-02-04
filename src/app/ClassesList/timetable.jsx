'use client';

import React, { useState, useEffect } from 'react';

const ScheduleTable = ({ className }) => {
  const [schedule, setSchedule] = useState([
    { lesson: '1 урок', start: '08:00', end: '08:45', name: '' },
    { lesson: '2 урок', start: '08:50', end: '09:35', name: '' },
    { lesson: '3 урок', start: '09:40', end: '10:25', name: '' },
    { lesson: '4 урок', start: '10:45', end: '11:30', name: '' },
    { lesson: '5 урок', start: '11:35', end: '12:20', name: '' },
    { lesson: '6 урок', start: '12:25', end: '13:10', name: '' },
    { lesson: 'Дополнительный урок 1', start: '14:00', end: '14:45', name: '' },
    { lesson: 'Дополнительный урок 2', start: '14:50', end: '15:35', name: '' },
  ]);

  const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
  const [dayOfWeek, setDayOfWeek] = useState(days[(new Date().getDay() + 6) % 7]);
  const [isAdmin, setIsAdmin] = useState(false);

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

  // Загрузка расписания из API
  const fetchSchedule = async () => {
    try {
      const response = await fetch(`/api/schedule?class=${className}&day=${dayOfWeek}`);
      if (response.ok) {
        const data = await response.json();
        const updatedSchedule = [...schedule];

        // Сопоставляем предметы с уроками
        data.subjects.forEach((subject, index) => {
          if (updatedSchedule[index]) {
            updatedSchedule[index].name = subject;
          }
        });

        setSchedule(updatedSchedule);
      } else {
        console.error('Ошибка при загрузке расписания:', response.status);
      }
    } catch (error) {
      console.error('Ошибка при запросе API:', error);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [className, dayOfWeek]);

  // Смена дня недели
  const handleDayChange = (newDayIndex) => {
    setDayOfWeek(days[newDayIndex]);
  };

  // Изменение названия урока
  const handleNameChange = (index, newName) => {
    const updatedSchedule = [...schedule];
    updatedSchedule[index].name = newName;
    setSchedule(updatedSchedule);
  };

  // Сохранение изменений (POST запрос)
  const saveChanges = async () => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          className,
          day: dayOfWeek,
          schedule,
        }),
      });

      if (response.ok) {
        
        alert('Изменения сохранены.');
      } else {
        console.log(response);
        alert('Ошибка при сохранении изменений.');
      }
    } catch (error) {
      console.error('Ошибка при отправке данных:', error);
      alert('Ошибка при сохранении изменений.');
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-center text-xl sm:text-2xl font-semibold mb-4 sm:mb-6">
        Расписание уроков для класса {className}
      </h1>
      <div className="mb-4">
        <label htmlFor="day-select" className="block mb-2 font-medium">
          Выберите день недели:
        </label>
        <select
          id="day-select"
          value={days.indexOf(dayOfWeek)}
          onChange={(e) => handleDayChange(Number(e.target.value))}
          className="border border-gray-300 rounded px-4 py-2 w-full sm:w-auto"
        >
          {days.map((day, index) => (
            <option key={index} value={index}>
              {day}
            </option>
          ))}
        </select>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
          <thead>
            <tr>
              <th className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2 text-left">Урок</th>
              <th className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2 text-left">Название урока</th>
              <th className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2 text-left">Начало</th>
              <th className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2 text-left">Конец</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((entry, index) => (
              <tr key={index}>
                <td className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">{entry.lesson}</td>
                <td className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">
                  {isAdmin ? (
                    <input
                      type="text"
                      value={entry.name}
                      onChange={(e) => handleNameChange(index, e.target.value)}
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm"
                      placeholder="Название урока"
                    />
                  ) : (
                    <span>{entry.name}</span>
                  )}
                </td>
                <td className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">{entry.start}</td>
                <td className="border border-gray-300 px-2 py-1 sm:px-4 sm:py-2">{entry.end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAdmin && (
        <button
          onClick={saveChanges}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-600 transition duration-200"
        >
          Сохранить изменения
        </button>
      )}
    </div>
  );
};

export default ScheduleTable;
