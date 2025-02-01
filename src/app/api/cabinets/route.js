import path from 'path';
import fs from 'fs/promises';

const dataFilePath = path.join(process.cwd(), 'public', 'data', 'cabinets.json');

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const teacherName = decodeURIComponent(searchParams.get('teacher') || '').trim();

    if (!teacherName) {
      return new Response(JSON.stringify({ error: 'Не указано имя преподавателя' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    const cabinets = JSON.parse(fileData);

    // Разбиваем имя преподавателя на слова и сортируем
    const normalizedTeacherName = teacherName.toLowerCase().split(/\s+/).sort().join(' ');

    // Поиск кабинета, игнорируя порядок слов
    const matchedCabinet = cabinets.find((cabinet) => {
      const cabinetNameNormalized = cabinet.responsiblePerson.trim().toLowerCase().split(/\s+/).sort().join(' ');
      return cabinetNameNormalized === normalizedTeacherName;
    });

    if (!matchedCabinet) {
      return new Response(JSON.stringify({ error: `Кабинет не найден для преподавателя: ${teacherName}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        cabinet: {
          cabinetNumber: matchedCabinet.cabinetNumber,
          cabinetType: matchedCabinet.cabinetType,
          capacity: matchedCabinet.capacity,
          pavilionNumber: matchedCabinet.pavilionNumber,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return new Response(JSON.stringify({ error: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function POST(req) {
  try {
    const { teacher, cabinet } = await req.json();

    if (!teacher || !cabinet) {
      return new Response(JSON.stringify({ error: 'Не указаны данные для обновления' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    const cabinets = JSON.parse(fileData);

    // Разбиваем имя преподавателя на слова и сортируем
    const normalizedTeacherName = teacher.toLowerCase().split(/\s+/).sort().join(' ');

    // Поиск кабинета
    let matchedCabinet = cabinets.find((cabinet) => {
      const cabinetNameNormalized = cabinet.responsiblePerson.trim().toLowerCase().split(/\s+/).sort().join(' ');
      return cabinetNameNormalized === normalizedTeacherName;
    });

    // Если преподаватель найден, обновляем кабинет
    if (matchedCabinet) {
      matchedCabinet.cabinetNumber = cabinet;
    } else {
      // Если преподаватель не найден, создаем новый объект
      const newCabinet = {
        responsiblePerson: teacher,
        cabinetNumber: cabinet,
        cabinetType: 'Не указан',  // You can set default values here
        capacity: 30,              // Example default value
        pavilionNumber: 'Не указан', // Example default value
      };
      cabinets.push(newCabinet);
    }

    // Записываем обновленные данные обратно в файл
    await fs.writeFile(dataFilePath, JSON.stringify(cabinets, null, 2), 'utf-8');

    return new Response(
      JSON.stringify({ message: 'Данные обновлены успешно' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Ошибка при обновлении данных:', error);
    return new Response(JSON.stringify({ error: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
