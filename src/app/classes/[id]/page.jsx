'use client';

import React, { useState, useEffect } from 'react';
import Lessons from './lessons'; 
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';

const ClassLessons = ({ params }) => {
  const { id } = params; 
  const decodedClassName = decodeURIComponent(id);
  const [studentData, setStudentData] = useState([]);
  const [stats, setStats] = useState({ total: 0, boys: 0, girls: 0 });
  const [expanded, setExpanded] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newStudent, setNewStudent] = useState({ firstName: '', lastName: '', birthDate: '', gender: 'male' });

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

  const addStudent = async () => {
    if (!newStudent.firstName || !newStudent.lastName || !newStudent.birthDate) {
      alert('Заполните все поля для добавления ученика.');
      return;
    }

    try {
      const response = await fetch(`/api/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': localStorage.getItem('AdminPas'),
        },
        body: JSON.stringify({ className: decodedClassName, ...newStudent }),
      });

      if (!response.ok) {
        throw new Error('Ошибка добавления ученика');
      }

      setStudentData(prev => [...prev, newStudent]);
      setStats(prev => ({
        ...prev,
        total: prev.total + 1,
        boys: newStudent.gender === 'male' ? prev.boys + 1 : prev.boys,
        girls: newStudent.gender === 'female' ? prev.girls + 1 : prev.girls,
      }));
      setNewStudent({ firstName: '', lastName: '', birthDate: '', gender: 'male' });
    } catch (error) {
      console.error('Ошибка добавления ученика:', error);
    }
  };

  const deleteStudent = async (student) => {
    try {
      const response = await fetch(`/api/students`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': localStorage.getItem('AdminPas'),
        },
        body: JSON.stringify({ className: decodedClassName, lastName: student.last_name }),
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления ученика');
      }

      setStudentData(prev => prev.filter(s => s.last_name !== student.last_name));
      setStats(prev => ({
        ...prev,
        total: prev.total - 1,
        boys: student.gender ? prev.boys - 1 : prev.boys,
        girls: student.gender ? prev.girls : prev.girls - 1,
      }));
    } catch (error) {
      console.error('Ошибка удаления ученика:', error);
    }
  };

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
                {isAdmin && (
                  <button
                    onClick={() => deleteStudent(student)}
                    className="bg-red-500 text-white px-3 py-1 mt-2 rounded hover:bg-red-400"
                  >
                    Удалить ученика
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {isAdmin && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Добавить ученика</h3>
            <input
              type="text"
              placeholder="Имя"
              value={newStudent.firstName}
              onChange={e => setNewStudent({ ...newStudent, firstName: e.target.value })}
              className="block w-full p-2 border rounded mb-2"
            />
            <input
              type="text"
              placeholder="Фамилия"
              value={newStudent.lastName}
              onChange={e => setNewStudent({ ...newStudent, lastName: e.target.value })}
              className="block w-full p-2 border rounded mb-2"
            />
            <input
              type="date"
              value={newStudent.birthDate}
              onChange={e => setNewStudent({ ...newStudent, birthDate: e.target.value })}
              className="block w-full p-2 border rounded mb-2"
            />
            <select
              value={newStudent.gender}
              onChange={e => setNewStudent({ ...newStudent, gender: e.target.value })}
              className="block w-full p-2 border rounded mb-2"
            >
              <option value="male">Мальчик</option>
              <option value="female">Девочка</option>
            </select>
            <button
              onClick={addStudent}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-400"
            >
              Добавить ученика
            </button>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ClassLessons;
