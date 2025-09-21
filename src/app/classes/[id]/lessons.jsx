import React, { useState, useEffect } from 'react';
import '@/app/styles/loader.css';

const Lessons = ({ classId }) => {
  const [lessons, setLessons] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [classTeacher, setClassTeacher] = useState(null);
  const [cabinets, setCabinets] = useState({});

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lessons?class=${classId}`);
      if (!response.ok) {
        throw new Error('Ошибка при получении данных о уроках');
      }
      const data = await response.json();

      setLessons(data);

      if (data['Воспитательный час']) {
        const teacher = data['Воспитательный час'][0]?.full_name || null;
        setClassTeacher(teacher);
      }

      // Загрузить данные о кабинетах
      await fetchCabinetsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCabinetsData = async (lessonsData) => {
    const cabinetData = {};
    for (const [lesson, teachers] of Object.entries(lessonsData)) {
      for (const teacher of teachers) {
        if (teacher?.full_name) {
          try {
            const response = await fetch(`/api/cabinets?teacher=${encodeURIComponent(teacher.full_name)}`);

            if (response.ok) {
              const { cabinet } = await response.json();
              cabinetData[`${lesson}_${teacher.full_name}`] = cabinet;
            }
          } catch (err) {
            console.error(`Ошибка при получении кабинета для ${teacher.full_name}:`, err);
          }
        }
      }
    }
    setCabinets(cabinetData);
  };

  const updateTeacher = async (lesson, newValue, group) => {
    if (!newValue || !group) {
      alert('Необходимо указать корректные данные.');
      return;
    }
    console.log('Updating teacher:', { lesson, newValue, group });

    try {
      const response = await fetch(`/api/lessons?class=${classId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_teacher',
          lesson,
          full_name: newValue,
          group,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить данные учителя');
      }

      await fetchLessons();
    } catch (err) {
      console.error('Ошибка при обновлении учителя:', err);
      alert('Произошла ошибка при обновлении данных учителя.');
    }
  };

  // Add new lesson
  const addLesson = async () => {
    const newLessonName = prompt('Введите название нового урока:');
    const teacherName = prompt('Введите имя преподавателя для этого урока (Фамилия Имя Отчество):');
    if (!newLessonName || !teacherName) {
      alert('Урок или имя преподавателя не могут быть пустыми.');
      return;
    }

    try {
      const response = await fetch(`/api/lessons?class=${classId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_lesson',
          lessonName: newLessonName,
          teacherName,
          group: decodedClassName,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось добавить урок');
      }

      await fetchLessons();
    } catch (err) {
      console.error('Ошибка при добавлении урока:', err);
      alert('Произошла ошибка при добавлении урока.');
    }
  };

  // Delete group from teacher
  const deleteGroup = async (lesson, teacherName, group) => {
    if (!lesson || !teacherName || !group) {
      alert('Недостаточно данных для удаления.');
      return;
    }

    try {
      const response = await fetch(`/api/lessons?class=${classId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonName: lesson,
          teacherName,
          group,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось удалить группу');
      }

      await fetchLessons();
    } catch (err) {
      console.error('Ошибка при удалении группы:', err);
      alert('Произошла ошибка при удалении группы.');
    }
  };

  // Handle change in cabinet input (if admin)
  const handleCabinetChange = async (lesson, teacher, newCabinetNumber) => {
    if (!newCabinetNumber) return;
    try {
      const response = await fetch(`/api/cabinets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_cabinet',
          lesson,
          teacher,
          cabinet: newCabinetNumber,
        }),
      });

      if (!response.ok) {
        throw new Error('Не удалось обновить номер кабинета');
      }

      await fetchCabinetsData(lessons);
    } catch (err) {
      console.error('Ошибка при обновлении кабинета:', err);
      alert('Произошла ошибка при обновлении кабинета.');
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [classId]);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center flex-col gap-[30px]">
        <p className="text-center mt-8">Загрузка данных...</p>
        <div className="loader"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center mt-8 text-red-700">Ошибка: {error}</div>;
  }

  const decodedClassName = decodeURIComponent(classId);

  return (
    <>
      <h1 className="text-2xl font-bold mb-4 text-center">
        Преподаватели {decodedClassName}
      </h1>

      {classTeacher && (
        <div className="bg-blue-100 p-4 rounded-lg mb-4 shadow-md text-center">
          <p className="text-xl font-semibold">Классный руководитель:</p>
          <p className="text-lg">{classTeacher}</p>
        </div>
      )}

      <div className="h-[300px] overflow-y-auto w-auto">
        <table className="table-auto border-collapse border border-gray-300 mx-auto">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2">Урок</th>
              <th className="border border-gray-300 px-4 py-2">Преподаватель</th>
              <th className="border border-gray-300 px-4 py-2">Кабинет</th>
              {isAdmin && <th className="border border-gray-300 px-4 py-2">Действия</th>}
            </tr>
          </thead>
          <tbody>
            {lessons &&
              Object.entries(lessons).map(([lesson, teachers]) => (
                <tr key={lesson}>
                  <td className="border border-gray-300 px-4 py-2">{lesson}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {teachers.map((teacher, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {isAdmin ? (
                          <input
                            className="border px-2 py-1 w-full"
                            value={teacher.full_name}
                            onChange={(e) =>
                              updateTeacher(lesson, e.target.value, decodedClassName)
                            }
                          />
                        ) : (
                          <div>{teacher.full_name}</div>
                        )}
                      </div>
                    ))}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {teachers.map((teacher, index) => (
                      <div key={index}>
                        {isAdmin ? (
                          <input
                            className="border px-2 py-1 w-full"
                            value={cabinets[`${lesson}_${teacher.full_name}`]?.cabinetNumber || ''}
                            onChange={(e) =>
                              handleCabinetChange(
                                lesson,
                                teacher.full_name,
                                e.target.value
                              )
                            }
                          />
                        ) : (
                          cabinets[`${lesson}_${teacher.full_name}`]?.cabinetNumber || 'Не указано'
                        )}
                      </div>
                    ))}
                  </td>

                  {isAdmin && (
                    <td className="border border-gray-300 px-4 py-2">
                      {teachers.map((teacher, index) => (
                        <div key={index} className="mb-2">
                          <button
                            className="bg-red-700 text-white px-2 py-1 rounded"
                            onClick={() => deleteGroup(lesson, teacher.full_name, decodedClassName)}
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </td>
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {isAdmin && (
        <div className="text-center mt-4">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={addLesson}
          >
            Добавить Урок
          </button>
        </div>
      )}
    </>
  );
};

export default Lessons;
