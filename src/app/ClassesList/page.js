'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import Footer from '@/app/components/Footer';
import ScheduleTable from './timetable';
import '@/app/styles/loader.css';


const ClassList = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [groupedClassData, setGroupedClassData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedClass, setSelectedClass] = useState("1А");
  const [newClassName, setNewClassName] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchClassData = async () => {
    try {
      const response = await fetch('/api/classlist');
      if (!response.ok) {
        throw new Error('Failed to fetch class data');
      }
      const data = await response.json();
      setGroupedClassData(data.groups);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassData();
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
    setSelectedClass('1А');
  }, []);

  const toggleSection = (index) => {
    setActiveSection(activeSection === index ? null : index);
  };

  const handleClassSelection = (className) => {
    setSelectedClass(className);
  };

  const addClassLetter = async () => {
    try {
      const classNumber = newClassName.match(/\d+/)?.[0];
      const letter = newClassName.match(/[А-ЯЁ]/i)?.[0];
      if (!classNumber || !letter) {
        alert('Введите корректное название класса, например "9Т"');
        return;
      }
      
      const response = await fetch('/api/classlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className: classNumber, letter }),
      });

      if (!response.ok) {
        throw new Error('Failed to add class letter');
      }
      
      fetchClassData();
      setNewClassName(''); // Очистить поле ввода
    } catch (error) {
      setError(error.message);
    }
  };

  const deleteClassLetter = async (className, letter) => {
    try {
      const response = await fetch('/api/classlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className, letter }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete class letter');
      }

      fetchClassData();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center flex-col gap-[30px]'>
        <p className="text-center mt-8">Загрузка данных...</p>
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-8 text-red-500">Ошибка: {error}</p>;
  }

  return (
    <>
      <Navbar />
      <div className="p-6">
        <ScheduleTable className={selectedClass} />
        <div className="flex justify-center mt-4">
          <Link href={`/classes/${selectedClass}`} className="text-blue-500 py-2 px-4 rounded">
            Перейти на страницу класса {selectedClass}
          </Link>
        </div>
        <h1 className="text-center text-2xl font-semibold mb-6">Список классов</h1>

        {/* Блок добавления нового класса */}
        {isAdmin && (
          <div className="bg-gray-50 p-4 mt-8">
            <h2 className="font-semibold mb-2">Добавить новый класс</h2>
            <input
              type="text"
              placeholder="Введите класс (например, 9Т)"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="border p-2 rounded w-full mb-2"
            />
            <button
              onClick={addClassLetter}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-400"
            >
              Добавить класс
            </button>
          </div>
        )}

        {groupedClassData.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-8">
            <h2 className="text-xl font-bold mb-4">{group.groupName}</h2>
            <div className="flex flex-wrap gap-4">
              {group.classes.map((section, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg overflow-hidden w-full sm:w-48">
                  <button
                    onClick={() => toggleSection(`${groupIndex}-${index}`)}
                    className="w-full bg-yellow-400 text-white p-4 font-medium hover:bg-yellow-300 transition-all rounded-lg"
                  >
                    Класс {section.name}
                  </button>
                  <div
                    className={`transition-[max-height] ease-in-out duration-300 overflow-hidden ${
                      activeSection === `${groupIndex}-${index}` ? 'max-h-screen' : 'max-h-0'
                    }`}
                  >
                    <div className="bg-gray-100 p-4">
                      {section.letters.map((letter, letterIndex) => (
                        <div key={letterIndex} className="py-2 flex justify-between items-center">
                          <button
                            onClick={() => handleClassSelection(`${section.name}${letter}`)}
                            className="text-blue-500 hover:underline"
                          >
                            {section.name}{letter}
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => deleteClassLetter(section.name, letter)}
                              className="text-red-500 hover:underline ml-4"
                            >
                              Удалить
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
};

export default ClassList;
