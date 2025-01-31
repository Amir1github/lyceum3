import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Путь к файлу JSON

const filePath = path.join(process.cwd(), 'public', 'data', 'workhour.json');// Обработчик GET-запроса
export async function GET() {
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    const workhourData = JSON.parse(fileData);
    return NextResponse.json(workhourData);
  } catch (error) {
    return NextResponse.json({ error: 'Не удалось загрузить расписание.' }, { status: 500 });
  }
}

// Обработчик POST-запроса
export async function POST(request) {
  try {
    const body = await request.json();

    // Проверяем, что тело запроса содержит корректные данные
    if (!Array.isArray(body) || body.some(item => !item.day || !item.hours)) {
      return NextResponse.json(
        { error: 'Invalid data format. Expected an array of { day, hours } objects.' },
        { status: 400 }
      );
    }

    // Читаем текущие данные из файла
    const fileData = fs.readFileSync(filePath, 'utf-8');
    let workhourData = JSON.parse(fileData);

    // Обновляем расписание
    body.forEach((newItem) => {
      const index = workhourData.findIndex(item => item.day === newItem.day);
      if (index !== -1) {
        workhourData[index].hours = newItem.hours;
      }
    });

    // Сохраняем обновленные данные обратно в файл
    fs.writeFileSync(filePath, JSON.stringify(workhourData, null, 2), 'utf-8');

    return NextResponse.json(workhourData);
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while processing the request.' },
      { status: 500 }
    );
  }
}
