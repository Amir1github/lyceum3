'use client';

import React, { useState, useEffect } from 'react';
import Lessons from './Lessons'; // Импортируем дочерний компонент
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

const ClassLessons = ({ params }) => {
  const { id } = params; // Получаем параметр класса из URL
  const decodedClassName = decodeURIComponent(id);
  const [studentData, setStudentData] = useState([]);
  const [stats, setStats] = useState({ total: 0, boys: 0, girls: 0 });
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchStudentStats = async () => {
      try {
        const response = await fetch(`/api/students?className=${decodedClassName}`);
        if (!response.ok) {
          throw new Error('Ошибка загрузки данных');
        }
        const data = await response.json();

        const boysCount = data.filter(student => student.gender).length;
        const girlsCount = data.length - boysCount;

        setStudentData(data);
        setStats({
          total: data.length,
          boys: boysCount,
          girls: girlsCount,
        });
      } catch (error) {
        console.error('Ошибка загрузки данных о студентах:', error);
      }
    };

    fetchStudentStats();
  }, [decodedClassName]);

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Класс {decodedClassName}</h1>
        {id && <Lessons classId={id} />}
        <div className="bg-gray-50 p-4 mt-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Статистика класса</h2>
          <p>Всего учеников: {stats.total}</p>
          <p>Мальчиков: {stats.boys}</p>
          <p>Девочек: {stats.girls}</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-400"
          >
            {expanded ? 'Скрыть список учеников' : 'Показать список учеников'}
          </button>
        </div>
        {expanded && (
          <div className="mt-4">
            {studentData.map(student => (
              <div
                key={student.student_id}
                className={`p-4 rounded-lg mb-2 ${
                  student.gender ? 'bg-blue-100' : 'bg-pink-100'
                }`}
              >
                <p className="font-semibold">
                  {student.last_name} {student.first_name} {student.middle_name}
                </p>
                <p>Возраст: {new Date().getFullYear() - new Date(student.birth_date).getFullYear()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClassLessons;
